import { useState } from 'react';
import { isValidPnr } from './pnrValidation';
import { fetchRoute } from './journeyService';
import { saveJourneyData } from './journeyStorage';

export default function PnrForm({ onSuccess }) {
  const [pnr, setPnr] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidPnr(pnr)) {
      setError('Please enter a valid 10-digit PNR number.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const journeyData = await fetchRoute(pnr);
      saveJourneyData(journeyData);
      if (onSuccess) {
        onSuccess(journeyData);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Could not verify PNR. Please try again.'
      );
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
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
