export default function JourneyHeader({ journeyData }) {
  if (!journeyData) return null;

  const { trainName, trainNo, pnr, currentStation, nextStation, upcomingStations } = journeyData;
  const journeyEnded = Array.isArray(upcomingStations) && upcomingStations.length === 0;

  return (
    <header>
      <div>
        <strong>{trainName}</strong> ({trainNo}) · PNR {pnr}
      </div>
      {journeyEnded ? (
        <p>Your journey has ended</p>
      ) : (
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
      )}
    </header>
  );
}
