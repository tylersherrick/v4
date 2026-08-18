import { Link, useSearchParams } from "react-router-dom";

export default function MLBInjuries({ awayTeam, homeTeam }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("gameInfo") || "lineups";

  function setTab(tab) {
    const params = new URLSearchParams(searchParams);

    if (tab === "lineups") {
      params.delete("gameInfo");
    } else {
      params.set("gameInfo", tab);
    }

    setSearchParams(params);
  }

  function renderPitcher(team) {
    const pitcher = team.probablePitcher;

    if (!pitcher) {
      return (
        <p className="mlb-starting-pitcher-empty">
          Starting pitcher not available.
        </p>
      );
    }

    return (
      <Link
        to={`/mlb/player/${pitcher.id}`}
        state={{
          playerName: pitcher.name,
          position: pitcher.position || "SP",
        }}
        className="mlb-starting-pitcher"
      >
        <span className="mlb-starting-pitcher-label">
          Starting Pitcher
        </span>

        <span className="mlb-starting-pitcher-name">
          {pitcher.name}
        </span>

        {pitcher.record && (
          <span className="mlb-starting-pitcher-record">
            {pitcher.record}
          </span>
        )}
      </Link>
    );
  }

  function renderLineup(team) {
    const lineup =
      team.lineup?.length
        ? team.lineup
        : team.batters
            ?.filter(
              (player) =>
                player.starter === true &&
                player.battingOrder != null &&
                player.battingOrder > 0
            )
            .sort(
              (a, b) =>
                a.battingOrder - b.battingOrder
            ) || [];

    if (!lineup.length) {
      return (
        <p className="mlb-lineup-empty">
          No lineup data available.
        </p>
      );
    }

    return (
      <div className="mlb-lineup-list">
        {lineup.map((player) => (
          <div
            key={player.id}
            className="mlb-lineup-player"
          >
            <span className="mlb-lineup-order">
              {player.battingOrder}.
            </span>

            <Link
              to={`/mlb/player/${player.id}`}
              state={{
                playerName: player.name,
                position: player.position,
              }}
              className="mlb-lineup-name"
            >
              {player.name}
            </Link>

            {player.position && (
              <span className="mlb-lineup-position">
                {player.position}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderInjuries(team) {
    if (!team.injuries?.length) {
      return (
        <p className="mlb-injury-empty">
          No injuries listed.
        </p>
      );
    }

    return (
      <div className="mlb-injury-list">
        {team.injuries.map((player) => (
          <div
            key={player.id}
            className="mlb-injury-player"
          >
            <Link
              to={`/mlb/player/${player.id}`}
              state={{
                playerName: player.name,
                position: player.position || null,
              }}
              className="mlb-injury-player-name"
            >
              {player.name}
            </Link>

            <div className="mlb-injury-details">
              {player.status && (
                <span>{player.status}</span>
              )}

              {player.injury && (
                <span>{player.injury}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mlb-game-info">
      <div className="mlb-game-info-tabs">
        <button
          className={
            activeTab === "lineups" ? "active" : ""
          }
          onClick={() => setTab("lineups")}
        >
          Starting Lineups
        </button>

        <button
          className={
            activeTab === "injuries" ? "active" : ""
          }
          onClick={() => setTab("injuries")}
        >
          Injuries
        </button>
      </div>

      {activeTab === "lineups" ? (
        <div className="mlb-lineups">
          <div className="mlb-lineups-team">
            <h3>{awayTeam.name}</h3>

            {renderPitcher(awayTeam)}

            {renderLineup(awayTeam)}
          </div>

          <div className="mlb-lineups-team">
            <h3>{homeTeam.name}</h3>

            {renderPitcher(homeTeam)}

            {renderLineup(homeTeam)}
          </div>
        </div>
      ) : (
        <div className="mlb-injuries">
          <div className="mlb-injuries-team">
            <h3>{awayTeam.name}</h3>
            {renderInjuries(awayTeam)}
          </div>

          <div className="mlb-injuries-team">
            <h3>{homeTeam.name}</h3>
            {renderInjuries(homeTeam)}
          </div>
        </div>
      )}
    </section>
  );
}