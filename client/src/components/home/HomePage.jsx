import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MLBGameCard from "../mlb/MLBGameCard.jsx";

const API_URL = "https://v4-vqu0.onrender.com";

export default function HomePage() {
  const [mlbGames, setMlbGames] = useState([]);

  useEffect(() => {
    async function loadMLBGames() {
      try {
        const response = await fetch(
          `${API_URL}/api/mlb/games?limit=3`
        );

        if (!response.ok) {
          throw new Error("Unable to load MLB games");
        }

        const data = await response.json();
        setMlbGames(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadMLBGames();
  }, []);

  return (
    <main>
      <nav className="sports-nav">
        <Link to="/mlb">MLB</Link>
        <span>CFB</span>
        <span>NFL</span>
        <span>NBA</span>
        <span>NHL</span>
      </nav>

      <h1>Game Center</h1>

      {mlbGames.length > 0 && (
        <section>
          <Link to="/mlb">
            <h2>MLB</h2>
          </Link>

          <div className="mlb-games-grid">
            {mlbGames.map((game) => (
              <MLBGameCard
                key={game.id}
                game={game}
                fromHome={true}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}