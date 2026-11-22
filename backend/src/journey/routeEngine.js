/**
 * journey/routeEngine.js
 * Works out upcoming stations, current station, and next station
 * based on journey schedule and an injected currentTime.
 */

/**
 * Converts a time string "HH:mm" on a reference date into an absolute timestamp (ms).
 * @param {string} timeStr - "HH:mm"
 * @param {Date} baseDate - Reference Date
 * @returns {number} Timestamp in ms
 */
function parseTimeToMs(timeStr, baseDate) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(baseDate.getTime());
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

/**
 * Calculates absolute departure and arrival timestamps for all stations
 * handling journeys that cross midnight.
 * @param {object} journey
 * @returns {Array<object>} Stations with absolute arrivalMs and departureMs
 */
function resolveStationTimestamps(journey) {
  const stations = journey.journeyStations || [];
  if (stations.length === 0) return [];

  const depBase = journey.departure ? new Date(journey.departure) : new Date();
  let currentBase = new Date(depBase.getTime());
  let lastSeenHour = currentBase.getHours();

  return stations.map((st, index) => {
    let arrivalMs = null;
    let departureMs = null;

    if (st.arrivalTime) {
      const [arrHour] = st.arrivalTime.split(':').map(Number);
      if (arrHour < lastSeenHour && (lastSeenHour - arrHour) > 6) {
        currentBase.setDate(currentBase.getDate() + 1);
      }
      lastSeenHour = arrHour;
      arrivalMs = parseTimeToMs(st.arrivalTime, currentBase);
    }

    if (st.departureTime) {
      const [depHour] = st.departureTime.split(':').map(Number);
      if (depHour < lastSeenHour && (lastSeenHour - depHour) > 6) {
        currentBase.setDate(currentBase.getDate() + 1);
      }
      lastSeenHour = depHour;
      departureMs = parseTimeToMs(st.departureTime, currentBase);
    }

    // For origin station where arrivalTime is null, set arrivalMs to -Infinity or departureMs
    return {
      original: st,
      arrivalMs,
      departureMs,
    };
  });
}

/**
 * Computes upcoming stations, current station, and next station for a journey.
 * @param {object} journey - Journey object containing journeyStations
 * @param {Date|string|number} currentTime - Injected current time
 * @returns {{ currentStation: object|null, nextStation: object|null, upcomingStations: Array<object> }}
 */
function getUpcomingStations(journey, currentTime) {
  const stations = journey?.journeyStations || [];
  if (stations.length === 0) {
    return {
      currentStation: null,
      nextStation: null,
      upcomingStations: [],
    };
  }

  const currentMs = new Date(currentTime).getTime();
  const resolved = resolveStationTimestamps(journey);

  let currentStation = null;
  let nextStation = null;
  const upcomingStations = [];

  for (let i = 0; i < resolved.length; i++) {
    const { original, arrivalMs, departureMs } = resolved[i];

    const hasPassed = (departureMs !== null && currentMs > departureMs) ||
                      (departureMs === null && arrivalMs !== null && currentMs > arrivalMs);

    if (!hasPassed) {
      upcomingStations.push(original);

      const isCurrentlyHere =
        (arrivalMs === null && departureMs !== null && currentMs <= departureMs) ||
        (arrivalMs !== null && departureMs !== null && currentMs >= arrivalMs && currentMs <= departureMs) ||
        (arrivalMs !== null && departureMs === null && currentMs === arrivalMs);

      if (isCurrentlyHere && !currentStation) {
        currentStation = original;
      }
    }
  }

  // Next station determination
  if (currentStation) {
    const currentIndex = stations.findIndex(s => s.code === currentStation.code);
    nextStation = currentIndex >= 0 && currentIndex < stations.length - 1
      ? stations[currentIndex + 1]
      : null;
  } else if (upcomingStations.length > 0) {
    nextStation = upcomingStations[0];
  }

  return {
    currentStation,
    nextStation,
    upcomingStations,
  };
}

module.exports = {
  getUpcomingStations,
};
