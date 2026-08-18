import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "https://v4-vqu0.onrender.com";

export default function MLBFullSchedule() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSchedule() {
      try {
        const response = await fetch(
          `${API_URL}/api/mlb/teams/${teamId}/schedule`
        );

        if (!response.ok) {
          throw new Error("Unable to load schedule");
        }

        const data = await response.json();
        setGames(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, [teamId]);

  if (loading) {
    return <p>Loading schedule...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          navigate(-1);
        }}
      >
        ← Back
      </a>
      <br />
      <Link to="/">← Back to Games</Link>

      <h1>Full Schedule</h1>

      {games.map((game) => (
        <div key={game.id}>
          <Link to={`/mlb/game/${game.id}`}>
            {new Date(game.date).toLocaleDateString()}
          </Link>

          <span>
            {" "}
            {game.homeAway === "home" ? "vs" : "at"}{" "}
            {game.opponent.abbreviation}
          </span>

          {game.result && (
            <span>
              {" "}
              {game.result} {game.score}-{game.opponentScore}
            </span>
          )}

          {!game.result && game.status?.detail && (
            <span> {game.status.detail}</span>
          )}
        </div>
      ))}
    </main>
  );
}