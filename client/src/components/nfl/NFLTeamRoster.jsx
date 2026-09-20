import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

const ROSTER_TABS = [
  ["offense", "Offense"],
  ["defense", "Defense"],
  ["specialTeams", "Special Teams"],
];

export default function NFLTeamRoster({ teamId }) {
  const [roster, setRoster] = useState(null);
  const [activeTab, setActiveTab] = useState("offense");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRoster() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/nfl/team/${teamId}/roster`
        );

        if (!response.ok) {
          throw new Error("Unable to load team roster");
        }

        const data = await response.json();

        setRoster(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRoster();
  }, [teamId]);

  if (loading) {
    return <p>Loading roster...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!roster) {
    return <p>Roster not found.</p>;
  }

  const players = roster[activeTab] || [];

  return (
    <section className="cfb-team-roster">
      <div className="cfb-team-roster-tabs">
        {ROSTER_TABS.map(([value, label]) => (
          <button
            key={value}
            className={
              activeTab === value ? "active" : ""
            }
            onClick={() => setActiveTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="cfb-team-roster-table">
        <div className="cfb-team-roster-header">
          <span>Player</span>
          <span>Pos</span>
          <span>HT</span>
          <span>WT</span>
        </div>

        {players.map((player) => (
          <Link
            key={player.id}
            to={`/nfl/player/${player.id}`}
            className="cfb-team-roster-player"
          >
            <div className="cfb-team-roster-player-info">
              {player.headshot ? (
                <img
                  src={player.headshot}
                  alt={player.name}
                />
              ) : (
                <div className="cfb-team-roster-headshot" />
              )}

              <div>
                <strong>{player.name}</strong>

                {player.jersey !== null && (
                  <span>#{player.jersey}</span>
                )}
              </div>
            </div>

            <span>{player.position || "-"}</span>
            <span>{player.height || "-"}</span>
            <span>{player.weight || "-"}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}