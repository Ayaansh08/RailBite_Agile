import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

import {
  JOURNEY_STORAGE_KEY,
  saveJourneyData,
  loadJourneyData,
  clearJourneyData,
} from './journeyStorage';
import { isValidPnr } from './pnrValidation';
import { fetchRoute } from './journeyService';
import PnrForm from './PnrForm';
import JourneyHeader from './JourneyHeader';

vi.mock('axios');

const SAMPLE_JOURNEY = {
  pnr: '1234567890',
  trainNo: '12009',
  trainName: 'Shatabdi Express',
  currentStation: { code: 'NDLS', name: 'New Delhi' },
  nextStation: { code: 'KURJ', name: 'Kurukshetra' },
  upcomingStations: [
    { code: 'KURJ', name: 'Kurukshetra', arrivalTime: '11:45' },
    { code: 'AGC', name: 'Agra Cantt', arrivalTime: '13:20' },
  ],
};

describe('journeyStorage (RB-105)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves, loads, and clears journeyData round trip', () => {
    saveJourneyData(SAMPLE_JOURNEY);
    expect(localStorage.getItem(JOURNEY_STORAGE_KEY)).not.toBeNull();
    expect(loadJourneyData()).toEqual(SAMPLE_JOURNEY);

    clearJourneyData();
    expect(loadJourneyData()).toBeNull();
  });

  it('returns null for corrupt JSON in localStorage', () => {
    localStorage.setItem(JOURNEY_STORAGE_KEY, '{bad json');
    expect(loadJourneyData()).toBeNull();
  });

  it('returns null when stored data does not match journeyData shape', () => {
    localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
    expect(loadJourneyData()).toBeNull();

    localStorage.setItem(
      JOURNEY_STORAGE_KEY,
      JSON.stringify({ pnr: '1234567890', trainNo: '12009', upcomingStations: 'not-an-array' })
    );
    expect(loadJourneyData()).toBeNull();
  });

  it('does not crash when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => saveJourneyData(SAMPLE_JOURNEY)).not.toThrow();
    expect(loadJourneyData()).toBeNull();
    expect(() => clearJourneyData()).not.toThrow();
  });
});

describe('pnrValidation (RB-105)', () => {
  it('accepts exactly 10 digits and rejects invalid formats', () => {
    expect(isValidPnr('1234567890')).toBe(true);
    expect(isValidPnr('12345')).toBe(false);
    expect(isValidPnr('12345678901')).toBe(false);
    expect(isValidPnr('12345abcde')).toBe(false);
    expect(isValidPnr('')).toBe(false);
  });
});

describe('journeyService (RB-105)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches route via GET /api/journey/:pnr/route', async () => {
    axios.get.mockResolvedValueOnce({ data: SAMPLE_JOURNEY });
    const data = await fetchRoute('1234567890');
    expect(axios.get).toHaveBeenCalledWith('/api/journey/1234567890/route');
    expect(data).toEqual(SAMPLE_JOURNEY);
  });
});

describe('PnrForm (RB-105)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows inline error for invalid PNR and makes zero API calls', async () => {
    const user = userEvent.setup();
    render(<PnrForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/pnr/i), '12345');
    await user.click(screen.getByRole('button', { name: /find|submit|check/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/10-digit/i);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('calls API once for valid PNR, saves journeyData, and invokes onSuccess', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    axios.get.mockResolvedValueOnce({ data: SAMPLE_JOURNEY });

    render(<PnrForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/pnr/i), '1234567890');
    await user.click(screen.getByRole('button', { name: /find|submit|check/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(SAMPLE_JOURNEY);
    });
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(loadJourneyData()).toEqual(SAMPLE_JOURNEY);
  });

  it('shows error message on API failure and keeps form usable', async () => {
    const user = userEvent.setup();
    axios.get.mockRejectedValueOnce({
      response: { status: 404, data: { message: 'PNR not found' } },
    });

    render(<PnrForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/pnr/i), '9999999999');
    const button = screen.getByRole('button', { name: /find|submit|check/i });
    await user.click(button);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    let resolveRequest;
    axios.get.mockImplementationOnce(
      () => new Promise((resolve) => { resolveRequest = resolve; })
    );

    render(<PnrForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/pnr/i), '1234567890');
    const button = screen.getByRole('button', { name: /find|submit|check/i });
    await user.click(button);

    expect(button).toBeDisabled();

    resolveRequest({ data: SAMPLE_JOURNEY });
    await waitFor(() => expect(button).not.toBeDisabled());
  });
});

describe('JourneyHeader (RB-105)', () => {
  it('renders current and next station', () => {
    render(<JourneyHeader journeyData={SAMPLE_JOURNEY} />);

    expect(screen.getByText(/current station/i)).toBeInTheDocument();
    expect(screen.getByText(/New Delhi/i)).toBeInTheDocument();
    expect(screen.getByText(/next station/i)).toBeInTheDocument();
    expect(screen.getByText(/Kurukshetra/i)).toBeInTheDocument();
  });

  it('handles missing next station gracefully', () => {
    const atDestination = {
      ...SAMPLE_JOURNEY,
      currentStation: { code: 'LKO', name: 'Lucknow' },
      nextStation: null,
    };
    render(<JourneyHeader journeyData={atDestination} />);

    expect(screen.getByText(/Lucknow/i)).toBeInTheDocument();
    expect(screen.getByText(/next station/i)).toBeInTheDocument();
  });

  it('shows "Your journey has ended" when upcomingStations is empty', () => {
    const ended = {
      ...SAMPLE_JOURNEY,
      currentStation: null,
      nextStation: null,
      upcomingStations: [],
    };
    render(<JourneyHeader journeyData={ended} />);

    expect(screen.getByText(/your journey has ended/i)).toBeInTheDocument();
  });
});

describe('RB-106: Error codes, whitespace trimming, and expired storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('trims whitespace around PNR before calling API', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    axios.get.mockResolvedValueOnce({ data: SAMPLE_JOURNEY });

    render(<PnrForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText(/pnr/i), '  1234567890  ');
    await user.click(screen.getByRole('button', { name: /find|submit|check/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(SAMPLE_JOURNEY));
    expect(axios.get).toHaveBeenCalledWith('/api/journey/1234567890/route');
  });

  it.each([
    ['INVALID_PNR', 400, /10-digit|valid pnr/i],
    ['PNR_NOT_FOUND', 404, /not found|could not find/i],
    ['JOURNEY_COMPLETED', 410, /ended|completed/i],
  ])('maps error code %s to a human message without raw server text and offers retry', async (code, status, expectedPattern) => {
    const user = userEvent.setup();
    axios.get.mockRejectedValueOnce({
      response: {
        status,
        data: { code, message: 'RAW_SERVER_STACK_DETAIL_XYZ' },
      },
    });

    render(<PnrForm onSuccess={vi.fn()} />);
    await user.type(screen.getByLabelText(/pnr/i), '1234567890');
    await user.click(screen.getByRole('button', { name: /find|submit|check/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(expectedPattern);
    expect(alert.textContent).not.toContain('RAW_SERVER_STACK_DETAIL_XYZ');

    const retryBtn = screen.getByRole('button', { name: /retry|try again/i });
    await user.click(retryBtn);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('treats saved journeyData with no upcoming stations as expired and clears it', () => {
    const expiredJourney = {
      ...SAMPLE_JOURNEY,
      currentStation: null,
      nextStation: null,
      upcomingStations: [],
    };
    saveJourneyData(expiredJourney);
    const onExpired = vi.fn();

    const loaded = loadJourneyData({ onExpired });

    expect(loaded).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(JOURNEY_STORAGE_KEY)).toBeNull();
  });
});
