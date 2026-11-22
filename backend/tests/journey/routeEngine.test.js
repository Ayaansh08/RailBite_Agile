const { getUpcomingStations } = require('../../src/journey/routeEngine');

describe('RB-103: Route Engine - getUpcomingStations(journey, currentTime)', () => {
  const sampleJourney = {
    pnr: '1234567890',
    trainNumber: '12009',
    trainName: 'Shatabdi Express',
    departure: '2026-04-29T10:00:00',
    arrival: '2026-04-29T16:30:00',
    journeyStations: [
      { code: 'NDLS', name: 'New Delhi', stopType: 'starting', arrivalTime: null, departureTime: '10:00' },
      { code: 'KURJ', name: 'Kurukshetra', stopType: 'halting', arrivalTime: '11:45', departureTime: '11:47' },
      { code: 'AGC', name: 'Agra Cantt', stopType: 'halting', arrivalTime: '13:20', departureTime: '13:22' },
      { code: 'LKO', name: 'Lucknow', stopType: 'destination', arrivalTime: '16:30', departureTime: null },
    ],
  };

  describe('Edge cases (written first)', () => {
    test('returns empty upcoming stations if stations array is empty', () => {
      const journey = { ...sampleJourney, journeyStations: [] };
      const result = getUpcomingStations(journey, new Date('2026-04-29T11:00:00'));
      expect(result.currentStation).toBeNull();
      expect(result.nextStation).toBeNull();
      expect(result.upcomingStations).toEqual([]);
    });

    test('returns empty upcoming stations if all stations have passed', () => {
      const result = getUpcomingStations(sampleJourney, new Date('2026-04-29T17:00:00'));
      expect(result.currentStation).toBeNull();
      expect(result.nextStation).toBeNull();
      expect(result.upcomingStations).toEqual([]);
    });

    test('handles single remaining station (destination)', () => {
      // 14:00 is after AGC (dep 13:22) but before LKO (arr 16:30)
      const result = getUpcomingStations(sampleJourney, new Date('2026-04-29T14:00:00'));
      expect(result.currentStation).toBeNull();
      expect(result.nextStation).toEqual(sampleJourney.journeyStations[3]);
      expect(result.upcomingStations).toHaveLength(1);
      expect(result.upcomingStations[0].code).toBe('LKO');
    });

    test('handles currentTime exactly equal to a station halting arrival time', () => {
      const result = getUpcomingStations(sampleJourney, new Date('2026-04-29T11:45:00'));
      expect(result.currentStation).toEqual(sampleJourney.journeyStations[1]);
      expect(result.nextStation).toEqual(sampleJourney.journeyStations[2]);
      expect(result.upcomingStations).toHaveLength(3);
      expect(result.upcomingStations[0].code).toBe('KURJ');
    });

    test('handles currentTime exactly equal to station departure time (train departing)', () => {
      const result = getUpcomingStations(sampleJourney, new Date('2026-04-29T11:47:00'));
      expect(result.currentStation).toEqual(sampleJourney.journeyStations[1]);
      expect(result.upcomingStations).toHaveLength(3);
    });

    test('handles journey crossing midnight correctly', () => {
      const overnightJourney = {
        trainNumber: '12301',
        trainName: 'Rajdhani Express',
        departure: '2026-04-29T16:55:00',
        arrival: '2026-04-30T09:55:00',
        journeyStations: [
          { code: 'NDLS', name: 'New Delhi', stopType: 'starting', arrivalTime: null, departureTime: '16:55' },
          { code: 'GAYA', name: 'Gaya Jn', stopType: 'halting', arrivalTime: '00:52', departureTime: '00:54' },
          { code: 'DHN', name: 'Dhanbad Jn', stopType: 'halting', arrivalTime: '04:30', departureTime: '04:32' },
          { code: 'HWH', name: 'Howrah', stopType: 'destination', arrivalTime: '09:55', departureTime: null },
        ],
      };

      // Query at 01:00 on April 30 (after GAYA 00:54, before DHN 04:30)
      const result = getUpcomingStations(overnightJourney, new Date('2026-04-30T01:00:00'));
      expect(result.currentStation).toBeNull();
      expect(result.nextStation).toEqual(overnightJourney.journeyStations[2]); // DHN
      expect(result.upcomingStations).toHaveLength(2);
      expect(result.upcomingStations.map(s => s.code)).toEqual(['DHN', 'HWH']);
    });
  });

  describe('Standard journey progression', () => {
    test('at train departure station before departure', () => {
      const result = getUpcomingStations(sampleJourney, new Date('2026-04-29T09:30:00'));
      expect(result.currentStation).toEqual(sampleJourney.journeyStations[0]); // NDLS
      expect(result.nextStation).toEqual(sampleJourney.journeyStations[1]); // KURJ
      expect(result.upcomingStations).toHaveLength(4);
    });

    test('in transit between stations', () => {
      const result = getUpcomingStations(sampleJourney, new Date('2026-04-29T10:30:00'));
      expect(result.currentStation).toBeNull();
      expect(result.nextStation).toEqual(sampleJourney.journeyStations[1]); // KURJ
      expect(result.upcomingStations).toHaveLength(3);
    });
  });
});
