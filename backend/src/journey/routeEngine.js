/**
 * journey/routeEngine.js
 * Works out upcoming stations, current station, and next station
 * based on journey schedule and an injected currentTime parameter.
 */

const OVERNIGHT_HOUR_THRESHOLD = 6;

/**
 * Converts a time string "HH:mm" on a reference date into an absolute timestamp (ms).
 * @param {string|null} timeStr - "HH:mm"
 * @param {Date} baseDate - Reference Date
 * @returns {number|null} Timestamp in ms, or null if timeStr is falsy
 */
function parseTimeToMs(timeStr, baseDate) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(baseDate.getTime());
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

/**
 * Calculates absolute departure and arrival timestamps for all stations,
 * cleanly handling journeys crossing midnight.
 * @param {object} journey
 * @returns {Array<{ original: object, arrivalMs: number|null, departureMs: number|null }>}
 */
function resolveStationTimestamps(journey) {
  const stations = journey.journeyStations || [];
  if (stations.length === 0) return [];

  const depBase = journey.departure ? new Date(journey.departure) : new Date();
  const currentBase = new Date(depBase.getTime());
  let lastSeenHour = currentBase.getHours();

  return stations.map((st) => {
    let arrivalMs = null;
    let departureMs = null;

    if (st.arrivalTime) {
      const [arrHour] = st.arrivalTime.split(':').map(Number);
      if (arrHour < lastSeenHour && (lastSeenHour - arrHour) > OVERNIGHT_HOUR_THRESHOLD) {
        currentBase.setDate(currentBase.getDate() + 1);
      }
      lastSeenHour = arrHour;
      arrivalMs = parseTimeToMs(st.arrivalTime, currentBase);
    }

    if (st.departureTime) {
      const [depHour] = st.departureTime.split(':').map(Number);
      if (depHour < lastSeenHour && (lastSeenHour - depHour) > OVERNIGHT_HOUR_THRESHOLD) {
        currentBase.setDate(currentBase.getDate() + 1);
      }
      lastSeenHour = depHour;
      departureMs = parseTimeToMs(st.departureTime, currentBase);
    }

    return {
      original: st,
      arrivalMs,
      departureMs,
    };
  });
}

/**
 * Evaluates whether a station has already completed its departure/arrival.
 * @param {number|null} arrivalMs
 * @param {number|null} departureMs
 * @param {number} currentMs
 * @returns {boolean}
 */
function isStationPassed(arrivalMs, departureMs, currentMs) {
  if (departureMs !== null) {
    return currentMs > departureMs;
  }
  return arrivalMs !== null && currentMs > arrivalMs;
}

/**
 * Evaluates whether the train is currently positioned at the station.
 * @param {number|null} arrivalMs
 * @param {number|null} departureMs
 * @param {number} currentMs
 * @returns {boolean}
 */
function isTrainAtStation(arrivalMs, departureMs, currentMs) {
  if (arrivalMs === null && departureMs !== null) {
    return currentMs <= departureMs;
  }
  if (arrivalMs !== null && departureMs !== null) {
    return currentMs >= arrivalMs && currentMs <= departureMs;
  }
  if (arrivalMs !== null && departureMs === null) {
    return currentMs === arrivalMs;
  }
  return false;
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
  const upcomingStations = [];

  for (const item of resolved) {
    const { original, arrivalMs, departureMs } = item;

    if (!isStationPassed(arrivalMs, departureMs, currentMs)) {
      upcomingStations.push(original);

      if (!currentStation && isTrainAtStation(arrivalMs, departureMs, currentMs)) {
        currentStation = original;
      }
    }
  }

  let nextStation = null;
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
