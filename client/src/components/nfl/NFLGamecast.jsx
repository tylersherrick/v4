function getFieldPosition(situation) {
  if (!situation) {
    return 50;
  }

  const yardsToEndzone =
    situation.yardsToEndzone ?? 50;

  return Math.max(
    0,
    Math.min(100, 100 - yardsToEndzone)
  );
}

const YARD_MARKERS = [
  { position: 10, label: "10" },
  { position: 20, label: "20" },
  { position: 30, label: "30" },
  { position: 40, label: "40" },
  { position: 50, label: "50" },
  { position: 60, label: "40" },
  { position: 70, label: "30" },
  { position: 80, label: "20" },
  { position: 90, label: "10" },
];

export default function NFLGamecast({ gamecast }) {
  if (!gamecast) {
    return <p>Gamecast unavailable.</p>;
  }

  const {
    currentSituation,
    currentDrive,
  } = gamecast;

  if (!currentSituation) {
    return <p>Live field position unavailable.</p>;
  }

  const fieldPosition =
    getFieldPosition(currentSituation);

  return (
    <section className="cfb-gamecast">
      <div className="cfb-gamecast-drive-header">
        <div className="cfb-gamecast-possession">
          {currentDrive?.team?.logo && (
            <img
              src={currentDrive.team.logo}
              alt={currentDrive.team.name}
            />
          )}

          <div>
            <strong>
              {currentDrive?.team?.name ||
                "Current Drive"}
            </strong>

            <span>
              {currentSituation.downDistanceText}
            </span>
          </div>
        </div>

        {currentDrive && (
          <div className="cfb-gamecast-drive-stats">
            <span>
              {currentDrive.plays ?? 0} plays
            </span>

            <span>
              {currentDrive.yards ?? 0} yards
            </span>

            <span>
              {currentDrive.timeElapsed || "0:00"}
            </span>
          </div>
        )}
      </div>

      <div className="cfb-gamecast-field">
        <div className="cfb-gamecast-endzone">
          END
        </div>

        <div className="cfb-gamecast-playing-field">
          {YARD_MARKERS.map((marker) => (
            <div
              key={marker.position}
              className="cfb-gamecast-yard-line"
              style={{
                left: `${marker.position}%`,
              }}
            >
              <span>{marker.label}</span>
            </div>
          ))}

          <div
            className="cfb-gamecast-ball"
            style={{
              left: `${fieldPosition}%`,
            }}
          />

          <div
            className="cfb-gamecast-position-label"
            style={{
              left: `${fieldPosition}%`,
            }}
          >
            {currentSituation.possessionText}
          </div>
        </div>

        <div className="cfb-gamecast-endzone">
          END
        </div>
      </div>

      {currentDrive && (
        <div className="cfb-gamecast-current-drive">
          <h3>Current Drive</h3>

          <div className="cfb-gamecast-play-list">
            {[...currentDrive.playByPlay]
              .reverse()
              .map((play) => (
                <div
                  key={play.id}
                  className="cfb-gamecast-play"
                >
                  <div className="cfb-gamecast-play-meta">
                    <strong>
                      {play.clock}
                    </strong>

                    {play.end?.text && (
                      <span>{play.end.text}</span>
                    )}
                  </div>

                  <p>{play.text}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}