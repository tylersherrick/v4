import { useState } from "react";

function getPeriodLabel(period) {
  const number = Number(period);

  if (number === 1) {
    return "1st Period";
  }

  if (number === 2) {
    return "2nd Period";
  }

  if (number === 3) {
    return "3rd Period";
  }

  if (number === 4) {
    return "Overtime";
  }

  if (number === 5) {
    return "Shootout";
  }

  return `Period ${number}`;
}

export default function NHLGamecast({
  gamecast,
  gameStatus,
}) {
  if (!gamecast?.periods?.length) {
    return <p>Gamecast unavailable.</p>;
  }

  const periods = [...gamecast.periods].sort(
    (a, b) => b.period - a.period
  );

  const isFinal = gameStatus?.state === "post";

  const currentPeriod = Number(
    gamecast.currentPlay?.period ||
      periods[0]?.period
  );

  const [openPeriods, setOpenPeriods] = useState(() => {
    if (isFinal) {
      return {};
    }

    return {
      [currentPeriod]: true,
    };
  });

  function togglePeriod(period) {
    setOpenPeriods((current) => ({
      ...current,
      [period]: !current[period],
    }));
  }

  return (
    <section className="cfb-gamecast">
      {!isFinal && gamecast.currentPlay && (
        <div className="cfb-gamecast-current-drive">
          <h3>Latest Play</h3>

          <div className="cfb-gamecast-play-list">
            <div className="cfb-gamecast-play">
              <div className="cfb-gamecast-play-meta">
                <strong>
                  {gamecast.currentPlay.clock}
                </strong>

                <span>
                  {getPeriodLabel(
                    gamecast.currentPlay.period
                  )}
                </span>
              </div>

              <p>{gamecast.currentPlay.text}</p>
            </div>
          </div>
        </div>
      )}

      {periods.map((period) => {
        const isOpen =
          openPeriods[period.period] || false;

        return (
          <div
            className="cfb-gamecast-current-drive"
            key={period.period}
          >
            <button
              type="button"
              className="cfb-gamecast-period-toggle"
              onClick={() =>
                togglePeriod(period.period)
              }
            >
              <h3>
                {getPeriodLabel(period.period)}
              </h3>

              <span>
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="cfb-gamecast-play-list">
                {(period.plays || []).map((play) => (
                  <div
                    key={play.id}
                    className="cfb-gamecast-play"
                  >
                    <div className="cfb-gamecast-play-meta">
                      <strong>{play.clock}</strong>

                      <span>{play.type}</span>

                      {play.scoringPlay && (
                        <span>
                          {play.awayScore} -{" "}
                          {play.homeScore}
                        </span>
                      )}
                    </div>

                    <p>{play.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}