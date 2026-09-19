import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

const PREGAME_LEADER_CATEGORIES = [
  ["passingYards", "Passing Yards"],
  ["rushingYards", "Rushing Yards"],
  ["receivingYards", "Receiving Yards"],
  ["sacks", "Sacks"],
  ["totalTackles", "Total Tackles"],
];

export default function CFBGameLeaders({
  game,
  isPregame,
  playerStatsTeam,
  setPlayerStatsTeam,
}) {
  const [pregameLeaders, setPregameLeaders] = useState({
    away: null,
    home: null,
  });

  useEffect(() => {
    if (
      !isPregame ||
      !game.awayTeam?.id ||
      !game.homeTeam?.id
    ) {
      return;
    }

    async function loadPregameLeaders() {
      try {
        const [awayResponse, homeResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/api/cfb/team-leaders/${game.awayTeam.id}`
            ),
            fetch(
              `${API_URL}/api/cfb/team-leaders/${game.homeTeam.id}`
            ),
          ]);

        if (!awayResponse.ok || !homeResponse.ok) {
          throw new Error(
            "Unable to load pregame leaders"
          );
        }

        const [away, home] = await Promise.all([
          awayResponse.json(),
          homeResponse.json(),
        ]);

        setPregameLeaders({
          away,
          home,
        });
      } catch (error) {
        console.error(error);
      }
    }

    loadPregameLeaders();
  }, [
    isPregame,
    game.awayTeam?.id,
    game.homeTeam?.id,
  ]);

  const selectedPlayerTeam =
    playerStatsTeam === "away"
      ? game.awayTeam
      : game.homeTeam;

  const selectedPregameLeaders =
    pregameLeaders[playerStatsTeam];

  return (
    <div className="cfb-leaders">
      <div className="cfb-player-stats-teams">
        <button
          className={
            playerStatsTeam === "away" ? "active" : ""
          }
          onClick={() => setPlayerStatsTeam("away")}
        >
          {game.awayTeam.abbreviation}
        </button>

        <button
          className={
            playerStatsTeam === "home" ? "active" : ""
          }
          onClick={() => setPlayerStatsTeam("home")}
        >
          {game.homeTeam.abbreviation}
        </button>
      </div>

      <div className="cfb-leaders-team">
        <div className="cfb-leaders-team-header">
          {selectedPlayerTeam.logo && (
            <img
              src={selectedPlayerTeam.logo}
              alt={selectedPlayerTeam.name}
            />
          )}

          <h2>{selectedPlayerTeam.name}</h2>
        </div>

        {isPregame ? (
          selectedPregameLeaders ? (
            PREGAME_LEADER_CATEGORIES.map(
              ([key, label]) => {
                const leader =
                  selectedPregameLeaders[key];

                if (!leader?.name) {
                  return null;
                }

                return (
                  <div
                    className="cfb-leader-category"
                    key={key}
                  >
                    <h3>{label}</h3>

                    <div className="cfb-leader">
                      {leader.headshot && (
                        <img
                          src={leader.headshot}
                          alt={leader.name}
                        />
                      )}

                      <div>
                        {leader.id ? (
                          <Link
                            to={`/cfb/player/${leader.id}`}
                          >
                            {leader.name}
                          </Link>
                        ) : (
                          <span>{leader.name}</span>
                        )}

                        <strong>
                          {leader.total ?? "-"}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              }
            )
          ) : (
            <p>Loading leaders...</p>
          )
        ) : selectedPlayerTeam.leaders?.length > 0 ? (
          selectedPlayerTeam.leaders
            .filter(
              (category) =>
                category.leaders?.length > 0
            )
            .map((category) => (
              <div
                className="cfb-leader-category"
                key={category.name}
              >
                <h3>{category.displayName}</h3>

                {category.leaders.map((leader) => (
                  <div
                    className="cfb-leader"
                    key={`${category.name}-${leader.id}`}
                  >
                    {leader.headshot && (
                      <img
                        src={leader.headshot}
                        alt={leader.name}
                      />
                    )}

                    <div>
                      <Link
                        to={`/cfb/player/${leader.id}`}
                      >
                        {leader.name}
                      </Link>

                      <strong>
                        {leader.value ?? "-"}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            ))
        ) : (
          <p>No leaders available.</p>
        )}
      </div>
    </div>
  );
}