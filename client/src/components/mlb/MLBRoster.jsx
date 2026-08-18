import { Link, useSearchParams } from "react-router-dom";

export default function MLBRoster({ players }) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (!players?.length) {
    return <p>No roster available.</p>;
  }

  const activeRosterTab =
    searchParams.get("roster") || "hitters";

  const pitchers = players.filter((player) =>
    ["SP", "RP"].includes(
      player.position?.abbreviation
    )
  );

  const hitters = players.filter(
    (player) =>
      !["SP", "RP"].includes(
        player.position?.abbreviation
      )
  );

  const displayedPlayers =
    activeRosterTab === "pitchers"
      ? pitchers
      : hitters;

  function setRosterTab(tab) {
    const params = new URLSearchParams(searchParams);

    if (tab === "hitters") {
      params.delete("roster");
    } else {
      params.set("roster", tab);
    }

    setSearchParams(params);
  }

  return (
    <section className="mlb-team-roster-section">
      <div className="mlb-team-roster-header">
        <h2>Roster</h2>

        <div className="mlb-team-roster-tabs">
          <button
            className={
              activeRosterTab === "hitters"
                ? "active"
                : ""
            }
            onClick={() => setRosterTab("hitters")}
          >
            Hitters
          </button>

          <button
            className={
              activeRosterTab === "pitchers"
                ? "active"
                : ""
            }
            onClick={() => setRosterTab("pitchers")}
          >
            Pitchers
          </button>
        </div>
      </div>

      <div className="mlb-team-roster-list">
        {displayedPlayers.map((player) => (
          <Link
            key={player.id}
            to={`/mlb/player/${player.id}`}
            state={{
              playerName: player.name,
              position:
                player.position?.abbreviation || null,
              jersey: player.jersey || null,
              headshot: player.headshot || null,
            }}
            className="mlb-team-roster-player"
          >
            {player.headshot ? (
              <img
                src={player.headshot}
                alt={player.name}
                className="mlb-team-roster-headshot"
              />
            ) : (
              <span className="mlb-team-roster-no-headshot">
                No Pic
              </span>
            )}

            <span className="mlb-team-roster-name">
              {player.name}
            </span>

            {player.position?.abbreviation && (
              <span className="mlb-team-roster-position">
                {player.position.abbreviation}
              </span>
            )}

            {player.jersey && (
              <span className="mlb-team-roster-jersey">
                #{player.jersey}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}