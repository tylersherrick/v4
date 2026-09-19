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

function getOrdinal(number) {
  if (number === 1) return "1st";
  if (number === 2) return "2nd";
  if (number === 3) return "3rd";

  return `${number}th`;
}

function formatLastPlay(text) {
  if (!text) return "";

  let play = text
    .replace(/^\(\d{1,2}:\d{2}\)\s*/, "")
    .replace(
      /^(?:No Huddle-)?(?:Shotgun|Under Center)\s*/i,
      ""
    )
    .replace(/^#\d+\s*/, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();

  const rushMatch = play.match(
    /^([A-Za-z.'’-]+)\s+rush(?:es)?(?:\s+\w+)?\s+for\s+(-?\d+)\s+yards?/i
  );

  if (rushMatch) {
    return `${rushMatch[1]} rush for ${rushMatch[2]} yards`;
  }

  const passMatch = play.match(
    /^([A-Za-z.'’-]+)\s+pass(?:es)?\s+(?:complete\s+)?to\s+(?:#\d+\s+)?([A-Za-z.'’-]+).*?for\s+(-?\d+)\s+yards?/i
  );

  if (passMatch) {
    return `${passMatch[1]} pass to ${passMatch[2]} for ${passMatch[3]} yards`;
  }

  const incompleteMatch = play.match(
    /^([A-Za-z.'’-]+)\s+pass\s+incomplete(?:\s+to\s+(?:#\d+\s+)?([A-Za-z.'’-]+))?/i
  );

  if (incompleteMatch) {
    return incompleteMatch[2]
      ? `${incompleteMatch[1]} pass incomplete to ${incompleteMatch[2]}`
      : `${incompleteMatch[1]} pass incomplete`;
  }

  const sackMatch = play.match(
    /^([A-Za-z.'’-]+)\s+sacked.*?for\s+(-?\d+)\s+yards?/i
  );

  if (sackMatch) {
    return `${sackMatch[1]} sacked for ${sackMatch[2]} yards`;
  }

  return play;
}

export default function CFBGameHeader({ game }) {
  const location = useLocation();

  const gamesLocation =
    location.state?.gamesLocation ||
    `/cfb${location.search}`;

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
          <Link
            to={`/cfb/team/${game.awayTeam.id}${location.search}`}
            state={{ gamesLocation, gameLocation: `${location.pathname}${location.search}`, }}
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
                {game.awayTeam.rank &&
                  `#${game.awayTeam.rank} `}
                {game.awayTeam.abbreviation}
                {awayHasPossession && " 🏈"}
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
            to={`/cfb/team/${game.homeTeam.id}${location.search}`}
            state={{ gamesLocation, gameLocation: `${location.pathname}${location.search}`, }}
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
                {game.homeTeam.rank &&
                  `#${game.homeTeam.rank} `}
                {game.homeTeam.abbreviation}
                {homeHasPossession && " 🏈"}
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

      {isLive &&
        game.liveGame &&
        !hideLiveDetails && (
          <div className="cfb-game-live">
            {game.liveGame.down && (
              <span>
                {getOrdinal(game.liveGame.down)} &{" "}
                {game.liveGame.distance}
              </span>
            )}

            {game.liveGame.text && (
              <p>
                {formatLastPlay(game.liveGame.text)}
              </p>
            )}
          </div>
        )}
    </section>
  );
}