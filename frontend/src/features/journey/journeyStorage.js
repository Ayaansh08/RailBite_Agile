export const JOURNEY_STORAGE_KEY = 'railbite.journeyData';

function isValidStation(station) {
  if (station === null) return true;
  return (
    typeof station === 'object' &&
    typeof station.code === 'string' &&
    typeof station.name === 'string'
  );
}

function isValidUpcomingStation(station) {
  return (
    station !== null &&
    typeof station === 'object' &&
    typeof station.code === 'string' &&
    typeof station.name === 'string' &&
    (station.arrivalTime === null || typeof station.arrivalTime === 'string')
  );
}

export function isValidJourneyData(data) {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.pnr !== 'string' || !data.pnr) return false;
  if (typeof data.trainNo !== 'string' || !data.trainNo) return false;
  if (typeof data.trainName !== 'string' || !data.trainName) return false;
  if (!isValidStation(data.currentStation)) return false;
  if (!isValidStation(data.nextStation)) return false;
  if (!Array.isArray(data.upcomingStations)) return false;
  return data.upcomingStations.every(isValidUpcomingStation);
}

export function saveJourneyData(journeyData) {
  try {
    localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(journeyData));
  } catch {
    // Ignore storage quota / disabled storage errors
  }
}

export function loadJourneyData() {
  try {
    const raw = localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidJourneyData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearJourneyData() {
  try {
    localStorage.removeItem(JOURNEY_STORAGE_KEY);
  } catch {
    // Ignore disabled storage errors
  }
}
