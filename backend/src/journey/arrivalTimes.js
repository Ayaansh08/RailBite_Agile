/**
 * journey/arrivalTimes.js
 * Computes delay-adjusted arrival times and day offsets for upcoming stations.
 */

const { getUpcomingStations } = require('./routeEngine');
const { ValidationError } = require('./errors');

const MAX_DELAY_MINUTES = 1440;
const MINUTES_PER_DAY = 1440;
const MINUTES_PER_HOUR = 60;
const OVERNIGHT_HOUR_THRESHOLD = 6;

/**
 * Validates that delayMinutes is an integer in [0, 1440].
 * @param {unknown} delayMinutes
 */
function validateDelayMinutes(delayMinutes) {
  if (!Number.isInteger(delayMinutes) || delayMinutes < 0 || delayMinutes > MAX_DELAY_MINUTES) {
    throw new ValidationError(`delayMinutes must be an integer between 0 and ${MAX_DELAY_MINUTES}.`);
  }
}

/**
 * Computes the scheduled dayOffset (0, 1, 2...) for each station code in the journey.
 * @param {object} journey
 * @returns {Map<string, number>}
 */
function buildStationDayOffsets(journey) {
  const offsets = new Map();
  const stations = journey?.journeyStations || [];
  if (stations.length === 0) return offsets;

  let dayOffset = 0;
  let lastHour = journey.departure ? new Date(journey.departure).getHours() : 0;

  for (const st of stations) {
    const timeStr = st.arrivalTime || st.departureTime;
    if (timeStr) {
      const [hour] = timeStr.split(':').map(Number);
      if (hour < lastHour && (lastHour - hour) > OVERNIGHT_HOUR_THRESHOLD) {
        dayOffset += 1;
      }
      lastHour = hour;
    }
    offsets.set(st.code, dayOffset);

    if (st.arrivalTime && st.departureTime) {
      const [depHour] = st.departureTime.split(':').map(Number);
      if (depHour < lastHour && (lastHour - depHour) > OVERNIGHT_HOUR_THRESHOLD) {
        dayOffset += 1;
      }
      lastHour = depHour;
    }
  }

  return offsets;
}

/**
 * Formats a scheduled "HH:mm" time plus delayMinutes into { arrivalTime, dayOffset }.
 * @param {string|null} scheduledTime
 * @param {number} baseDayOffset
 * @param {number} delayMinutes
 * @returns {{ arrivalTime: string|null, dayOffset: number }}
 */
function applyDelay(scheduledTime, baseDayOffset, delayMinutes) {
  if (!scheduledTime) {
    return { arrivalTime: null, dayOffset: baseDayOffset };
  }

  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const totalMinutes = (baseDayOffset * MINUTES_PER_DAY) + (hours * MINUTES_PER_HOUR) + minutes + delayMinutes;
  const dayOffset = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const minuteOfDay = totalMinutes % MINUTES_PER_DAY;
  const arrHours = String(Math.floor(minuteOfDay / MINUTES_PER_HOUR)).padStart(2, '0');
  const arrMins = String(minuteOfDay % MINUTES_PER_HOUR).padStart(2, '0');

  return {
    arrivalTime: `${arrHours}:${arrMins}`,
    dayOffset,
  };
}

/**
 * Calculates delay-adjusted arrival times for upcoming stations.
 * Reuses getUpcomingStations from routeEngine.
 * @param {object} journey
 * @param {Date|string|number} currentTime
 * @param {number} [delayMinutes]
 * @returns {{ currentStation: object|null, nextStation: object|null, upcomingStations: Array<object> }}
 */
function getArrivalTimes(journey, currentTime, delayMinutes) {
  const effectiveDelay = delayMinutes === undefined ? (journey?.delayMinutes ?? 0) : delayMinutes;
  validateDelayMinutes(effectiveDelay);

  const { currentStation, nextStation, upcomingStations } = getUpcomingStations(journey, currentTime);
  const dayOffsets = buildStationDayOffsets(journey);

  const mappedUpcoming = upcomingStations.map((st) => {
    const scheduledTime = st.arrivalTime || st.departureTime || null;
    const baseDayOffset = dayOffsets.get(st.code) || 0;
    const { arrivalTime, dayOffset } = applyDelay(scheduledTime, baseDayOffset, effectiveDelay);

    return {
      code: st.code,
      name: st.name,
      scheduledTime,
      arrivalTime,
      dayOffset,
    };
  });

  return {
    currentStation,
    nextStation,
    upcomingStations: mappedUpcoming,
  };
}

module.exports = {
  getArrivalTimes,
};
