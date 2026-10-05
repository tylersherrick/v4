import { Link, NavLink } from "react-router-dom";

export default function SportsNav({
  showBack = false,
  activeLeague = null,
  onLeagueChange = null,
}) {
  const leagues = [
    { id: "mlb", label: "MLB", enabled: true },
    { id: "cfb", label: "CFB", enabled: true },
    { id: "nfl", label: "NFL", enabled: true },
    { id: "nhl", label: "NHL", enabled: true },
    { id: "nba", label: "NBA", enabled: false },
  ];

  return (
    <nav className="sports-nav">
      {leagues.map((league) => {
        if (!league.enabled) {
          return (
            <span key={league.id}>
              {league.label}
            </span>
          );
        }

        if (onLeagueChange) {
          return (
            <button
              key={league.id}
              type="button"
              className={
                activeLeague === league.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                onLeagueChange(league.id)
              }
            >
              {league.label}
            </button>
          );
        }

        return (
          <NavLink
            key={league.id}
            to={`/${league.id}`}
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            {league.label}
          </NavLink>
        );
      })}

      {showBack && (
        <Link
          className="sports-nav-back"
          to="/"
        >
          ← Back to Game Center
        </Link>
      )}
    </nav>
  );
}