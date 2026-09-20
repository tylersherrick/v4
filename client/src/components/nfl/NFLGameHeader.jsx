const TIME_ZONE = "America/Chicago";

function getDateKey(date) {
  return date.toLocaleDateString("en-CA", {
    timeZone: TIME_ZONE,
  });
}

function getYesterday() {
  const date = new Date();

  date.setDate(date.getDate() - 1);

  return date;
}

function getOrdinal(number) {
  if (number === 1) return "1st";
  if (number === 2) return "2nd";
  if (number === 3) return "3rd";

  return `${number}th`;
}

export default function NFLGameHeader({ game }) {
  const isPregame = game.status?.state === "pre";
  const isLive = game.status?.state === "in";

  const awayHasPossession =
    isLive &&
    String(game.liveGame?.possession) ===
      String(game.awayTeam.id);

  const homeHasPossession =
    isLive &&
    String(game.liveGame?.possession) ===
      String(game.homeTeam.id);

  const gameDate = new Date(game.date);

  const isToday =
    getDateKey(gameDate) === getDateKey(new Date());

  const isYesterday =
    getDateKey(gameDate) === getDateKey(getYesterday());

  let formattedDate;

  if (isToday) {
    formattedDate = "Today";
  } else if (isYesterday) {
    formattedDate = "Yesterday";
  } else {
    formattedDate = gameDate
      .toLocaleDateString("en-US", {
        timeZone: TIME_ZONE,
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      .replace("Sep ", "Sept ");
  }

  const formattedTime = gameDate.toLocaleTimeString(
    "en-US",
    {
      timeZone: TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
    }
  );

  const gameStatus = isPregame
    ? formattedTime
    : game.status?.detail;

  const hideLiveDetails =
    game.status?.detail
      ?.toLowerCase()
      .includes("end of") ||
    game.status?.detail
      ?.toLowerCase()
      .includes("halftime");

  return (
    <section className="game-header">
      <h1>
        {game.awayTeam.name} at {game.homeTeam.name}
      </h1>

      <div className="game-scoreboard">
        <div className="game-team">
          <div className="game-team-info">
            {game.awayTeam.logo && (
              <img
                src={game.awayTeam.logo}
                alt={game.awayTeam.name}
              />
            )}

            <div className="game-team-details">
              <strong>
                {game.awayTeam.abbreviation}
                {awayHasPossession && " 🏈"}
              </strong>

              {game.awayTeam.record && (
                <span>{game.awayTeam.record}</span>
              )}
            </div>
          </div>

          {!isPregame && (
            <strong>{game.awayTeam.score}</strong>
          )}
        </div>

        <div className="game-team">
          <div className="game-team-info">
            {game.homeTeam.logo && (
              <img
                src={game.homeTeam.logo}
                alt={game.homeTeam.name}
              />
            )}

            <div className="game-team-details">
              <strong>
                {game.homeTeam.abbreviation}
                {homeHasPossession && " 🏈"}
              </strong>

              {game.homeTeam.record && (
                <span>{game.homeTeam.record}</span>
              )}
            </div>
          </div>

          {!isPregame && (
            <strong>{game.homeTeam.score}</strong>
          )}
        </div>
      </div>

      <p className="game-status">
        {gameStatus}
        {!isLive && ` · ${formattedDate}`}
      </p>

      {isLive &&
        game.liveGame?.down > 0 &&
        game.gamecast?.currentSituation?.possessionText?.length > 3 &&
        !hideLiveDetails && (
          <div className="cfb-game-live-situation">
            <span className="cfb-game-live-situation-text">
              {getOrdinal(game.liveGame.down)} &{" "}
              {game.liveGame.distance} ·{" "}
              {game.gamecast.currentSituation.possessionText}
            </span>
          </div>
        )}
    </section>
  );
}