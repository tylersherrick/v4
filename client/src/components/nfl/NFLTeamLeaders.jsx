import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

const LEADER_CATEGORIES = [
  ["passingYards", "Passing Yards"],
  ["rushingYards", "Rushing Yards"],
  ["receivingYards", "Receiving Yards"],
  ["sacks", "Sacks"],
  ["totalTackles", "Total Tackles"],
];

export default function NFLTeamLeaders({ teamId }) {
  const [leaders, setLeaders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeaders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/nfl/team-leaders/${teamId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load team leaders");
        }

        const data = await response.json();

        setLeaders(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadLeaders();
  }, [teamId]);

  if (loading) {
    return <p>Loading leaders...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!leaders) {
    return <p>Leaders not found.</p>;
  }

  const availableLeaders = LEADER_CATEGORIES.filter(
    ([key]) => leaders[key]
  );

  return (
    <section className="cfb-team-roster cfb-team-leaders">
      <div className="cfb-team-roster-table">
        <div className="cfb-team-roster-header cfb-team-leaders-row">
          <span>Player</span>
          <span>Category</span>
          <span>Total</span>
          <span>Per Game</span>
        </div>

        {availableLeaders.map(([key, label]) => {
          const leader = leaders[key];

          return (
            <Link
              key={key}
              to={`/nfl/player/${leader.id}`}
              className="cfb-team-roster-player cfb-team-leaders-row"
            >
              <div className="cfb-team-roster-player-info">
                {leader.headshot ? (
                  <img
                    src={leader.headshot}
                    alt={leader.name}
                  />
                ) : (
                  <div className="cfb-team-roster-headshot" />
                )}

                <div>
                  <strong>{leader.name}</strong>
                </div>
              </div>

              <span>{label}</span>
              <span>{leader.total ?? "-"}</span>
              <span>
                {leader.perGame !== null
                  ? leader.perGame
                  : "-"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}