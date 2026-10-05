import {
  Link,
  useLocation,
} from "react-router-dom";

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

export default function NHLGameHeader({ game }) {
  const location = useLocation();

  const gamesLocation =
    location.state?.gamesLocation ||
    `/nhl${location.search}`;

  const isPregame = game.status?.state === "pre";
  const isLive = game.status?.state === "in";

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

  return (
    <section className="game-header">
      <h1>
        {game.awayTeam.name} at {game.homeTeam.name}
      </h1>

      <div className="game-scoreboard">
        <div className="game-team">
          <Link
            to={`/nhl/team/${game.awayTeam.id}${location.search}`}
            state={{
              gamesLocation,
              gameLocation: `${location.pathname}${location.search}`,
            }}
            className="game-team-info"
          >
            {game.awayTeam.logo && (
              <img
                src={game.awayTeam.logo}
                alt={game.awayTeam.name}
              />
            )}

            <div className="game-team-details">
              <strong>
                {game.awayTeam.abbreviation}
              </strong>

              {game.awayTeam.record && (
                <span>{game.awayTeam.record}</span>
              )}
            </div>
          </Link>

          {!isPregame && (
            <strong>{game.awayTeam.score}</strong>
          )}
        </div>

        <div className="game-team">
          <Link
            to={`/nhl/team/${game.homeTeam.id}${location.search}`}
            state={{
              gamesLocation,
              gameLocation: `${location.pathname}${location.search}`,
            }}
            className="game-team-info"
          >
            {game.homeTeam.logo && (
              <img
                src={game.homeTeam.logo}
                alt={game.homeTeam.name}
              />
            )}

            <div className="game-team-details">
              <strong>
                {game.homeTeam.abbreviation}
              </strong>

              {game.homeTeam.record && (
                <span>{game.homeTeam.record}</span>
              )}
            </div>
          </Link>

          {!isPregame && (
            <strong>{game.homeTeam.score}</strong>
          )}
        </div>
      </div>

      <p className="game-status">
        {gameStatus}
        {!isLive && ` · ${formattedDate}`}
      </p>
    </section>
  );
}