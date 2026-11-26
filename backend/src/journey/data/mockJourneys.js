/**
 * journey/data/mockJourneys.js
 * Seed data for mock PNR journeys ported from prototype data/mockPnrs.js.
 */

const mockJourneys = {
  "1234567890": {
    pnr: "1234567890",
    trainNumber: "12009",
    trainName: "Shatabdi Express",
    bookingClass: "CC",
    bookingStatus: "CNF",
    passengerCount: 1,
    from: { code: "NDLS", name: "New Delhi" },
    to: { code: "LKO", name: "Lucknow" },
    departure: "2026-04-29T10:00:00",
    arrival: "2026-04-29T16:30:00",
    delayMinutes: 0,
    journeyStations: [
      { code: "NDLS", name: "New Delhi",   stopType: "starting",    arrivalTime: null,    departureTime: "10:00" },
      { code: "KURJ", name: "Kurukshetra", stopType: "halting",     arrivalTime: "11:45", departureTime: "11:47" },
      { code: "AGC",  name: "Agra Cantt",  stopType: "halting",     arrivalTime: "13:20", departureTime: "13:22" },
      { code: "LKO",  name: "Lucknow",     stopType: "destination", arrivalTime: "16:30", departureTime: null    },
    ],
  },

  "9876543210": {
    pnr: "9876543210",
    trainNumber: "12301",
    trainName: "Rajdhani Express",
    bookingClass: "3A",
    bookingStatus: "CNF",
    passengerCount: 2,
    from: { code: "NDLS", name: "New Delhi" },
    to: { code: "HWH", name: "Howrah" },
    departure: "2026-04-29T16:55:00",
    arrival: "2026-04-30T09:55:00",
    delayMinutes: 0,
    journeyStations: [
      { code: "NDLS", name: "New Delhi",  stopType: "starting",    arrivalTime: null,    departureTime: "16:55" },
      { code: "GAYA", name: "Gaya Jn",    stopType: "halting",     arrivalTime: "00:52", departureTime: "00:54" },
      { code: "DHN",  name: "Dhanbad Jn", stopType: "halting",     arrivalTime: "04:30", departureTime: "04:32" },
      { code: "HWH",  name: "Howrah",     stopType: "destination", arrivalTime: "09:55", departureTime: null    },
    ],
  },

  "1111111111": {
    pnr: "1111111111",
    trainNumber: "12221",
    trainName: "Duronto Express",
    bookingClass: "SL",
    bookingStatus: "CNF",
    passengerCount: 1,
    from: { code: "MMCT", name: "Mumbai Central" },
    to: { code: "NDLS", name: "New Delhi" },
    departure: "2026-04-29T23:00:00",
    arrival: "2026-04-30T15:55:00",
    delayMinutes: 0,
    journeyStations: [
      { code: "MMCT", name: "Mumbai Central", stopType: "starting",    arrivalTime: null,    departureTime: "23:00" },
      { code: "ST",   name: "Surat",          stopType: "halting",     arrivalTime: "01:30", departureTime: "01:32" },
      { code: "BRC",  name: "Vadodara",       stopType: "halting",     arrivalTime: "03:00", departureTime: "03:05" },
      { code: "NDLS", name: "New Delhi",      stopType: "destination", arrivalTime: "15:55", departureTime: null    },
    ],
  },

  "2222222222": {
    pnr: "2222222222",
    trainNumber: "12391",
    trainName: "Garib Rath Express",
    bookingClass: "3A",
    bookingStatus: "WL/3",
    passengerCount: 3,
    from: { code: "NDLS", name: "New Delhi" },
    to: { code: "PNBE", name: "Patna" },
    departure: "2026-04-29T19:30:00",
    arrival: "2026-04-30T07:00:00",
    delayMinutes: 0,
    journeyStations: [
      { code: "NDLS", name: "New Delhi", stopType: "starting",    arrivalTime: null,    departureTime: "19:30" },
      { code: "CNB",  name: "Kanpur",    stopType: "halting",     arrivalTime: "00:10", departureTime: "00:12" },
      { code: "ALD",  name: "Prayagraj", stopType: "halting",     arrivalTime: "02:30", departureTime: "02:35" },
      { code: "PNBE", name: "Patna",     stopType: "destination", arrivalTime: "07:00", departureTime: null    },
    ],
  },

  "3333333333": {
    pnr: "3333333333",
    trainNumber: "12953",
    trainName: "Aug Kranti Rajdhani",
    bookingClass: "2A",
    bookingStatus: "CNF",
    passengerCount: 1,
    from: { code: "NDLS", name: "New Delhi" },
    to: { code: "BCT", name: "Mumbai Central" },
    departure: "2026-04-29T17:05:00",
    arrival: "2026-04-30T08:35:00",
    delayMinutes: 0,
    journeyStations: [
      { code: "NDLS", name: "New Delhi",    stopType: "starting",    arrivalTime: null,    departureTime: "17:05" },
      { code: "RTM",  name: "Ratlam",       stopType: "halting",     arrivalTime: "02:00", departureTime: "02:05" },
      { code: "BRC",  name: "Vadodara",     stopType: "halting",     arrivalTime: "05:30", departureTime: "05:32" },
      { code: "BCT",  name: "Mumbai Central", stopType: "destination", arrivalTime: "08:35", departureTime: null },
    ],
  },
};

module.exports = mockJourneys;
