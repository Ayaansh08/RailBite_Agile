import { useState } from 'react';
import { isValidPnr } from './pnrValidation';
import { fetchRoute } from './journeyService';
import { saveJourneyData } from './journeyStorage';

const ERROR_MESSAGES = {
  INVALID_PNR: 'Please enter a valid 10-digit PNR number.',
  PNR_NOT_FOUND: 'We could not find a journey for that PNR. Please check and try again.',
  JOURNEY_COMPLETED: 'This journey has already ended.',
};

const FALLBACK_ERROR_MESSAGE = 'Could not verify PNR. Please try again.';

function mapApiError(err) {
  const code = err?.response?.data?.code;
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  return FALLBACK_ERROR_MESSAGE;
}

export default function PnrForm({ onSuccess }) {
  const [pnr, setPnr] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedPnr = pnr.trim();
    if (!isValidPnr(trimmedPnr)) {
      setError(ERROR_MESSAGES.INVALID_PNR);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const journeyData = await fetchRoute(trimmedPnr);
      saveJourneyData(journeyData);
      if (onSuccess) {
        onSuccess(journeyData);
      }
    } catch (err) {
      setError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="pnr-input">PNR Number</label>
      <input
        id="pnr-input"
        type="text"
        value={pnr}
        onChange={(e) => {
          setPnr(e.target.value);
          setError('');
        }}
        placeholder="Enter 10-digit PNR"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Checking...' : 'Find Journey'}
      </button>
      {error && (
        <div>
          <p role="alert">{error}</p>
          <button type="button" onClick={() => setError('')}>
            Retry
          </button>
        </div>
      )}
    </form>
  );
}
