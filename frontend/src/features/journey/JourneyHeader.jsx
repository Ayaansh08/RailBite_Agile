export default function JourneyHeader({ journeyData }) {
  if (!journeyData) return null;

  const { trainName, trainNo, pnr, currentStation, nextStation } = journeyData;

  return (
    <header>
      <div>
        <strong>{trainName}</strong> ({trainNo}) · PNR {pnr}
      </div>
      <div>
        <div>
          <span>Current Station: </span>
          <span>{currentStation ? currentStation.name : 'In transit'}</span>
        </div>
        <div>
          <span>Next Station: </span>
          <span>{nextStation ? nextStation.name : 'Destination reached'}</span>
        </div>
      </div>
    </header>
  );
}
