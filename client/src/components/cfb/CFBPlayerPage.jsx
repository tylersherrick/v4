import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

function hasValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "--" &&
    value !== "-"
  );
}

const HIDDEN_CATEGORIES = new Set([
  "general",
]);

const RELEVANT_STATS = {
  passing: [
    "gamesPlayed",
    "completions",
    "passingAttempts",
    "completionPct",
    "passingYards",
    "yardsPerPassAttempt",
    "passingYardsPerGame",
    "passingTouchdowns",
    "interceptions",
    "QBRating",
    "longPassing",
  ],
  rushing: [
    "gamesPlayed",
    "rushingAttempts",
    "rushingYards",
    "yardsPerRushAttempt",
    "rushingYardsPerGame",
    "rushingTouchdowns",
    "longRushing",
  ],
  receiving: [
    "gamesPlayed",
    "receptions",
    "receivingYards",
    "yardsPerReception",
    "receivingYardsPerGame",
    "receivingTouchdowns",
    "longReception",
  ],
  scoring: [
    "totalTouchdowns",
    "totalPoints",
    "twoPointConversions",
  ],
};

function cleanCategories(categories = []) {
  return categories
    .filter(
      (category) =>
        !HIDDEN_CATEGORIES.has(category.name?.toLowerCase())
    )
    .map((category) => {
      const seen = new Set();

      const relevantStats =
        RELEVANT_STATS[category.name?.toLowerCase()];

      const cleanedStats = (category.stats || []).filter((stat) => {
        if (
          relevantStats &&
          !relevantStats.includes(stat.name)
        ) {
          return false;
        }
        if (!hasValue(stat.value)) {
          return false;
        }

        const key = stat.name || stat.displayName;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });

      return {
        ...category,
        stats: cleanedStats,
      };
    })
    .filter(
      (category) =>
        category.stats.length > 0 &&
        category.stats.some((stat) => {
          const value = Number(
            String(stat.value).replace(/[%,$]/g, "")
          );

          return Number.isNaN(value) || value !== 0;
        })
    );
}

function StatTable({ category }) {
  return (
    <div className="cfb-player-stat-table">
      <h2>{category.displayName}</h2>

      {category.stats.map((stat) => (
        <div
          className="cfb-player-stat-row"
          key={stat.name}
        >
          <span>{stat.displayName}</span>
          <strong>{stat.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function CFBPlayerPage() {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlayer() {
      try {
        const [playerResponse, statsResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/cfb/player/${playerId}`),
            fetch(`${API_URL}/api/cfb/player/${playerId}/stats`),
          ]);

        if (!playerResponse.ok || !statsResponse.ok) {
          throw new Error("Unable to load player");
        }

        const [playerData, statsData] =
          await Promise.all([
            playerResponse.json(),
            statsResponse.json(),
          ]);

        const categories = cleanCategories(
          statsData.categories
        );

        const cleanedStats = {
          ...statsData,
          categories,
        };

        setPlayer(playerData);
        setStats(cleanedStats);
        setActiveCategory(categories[0]?.name || "");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlayer();
  }, [playerId]);

  if (loading) {
    return <p>Loading player...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const selectedCategory = stats.categories?.find(
    (category) => category.name === activeCategory
  );

  return (
    <main className="cfb-player-page">
      <div className="cfb-player-nav">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            navigate(-1);
          }}
        >
          ← Back
        </a>

        <Link to="/cfb">← Back to Games</Link>
      </div>

      <section className="cfb-player-header">
        {player.headshot && (
          <img
            className="cfb-player-headshot"
            src={player.headshot}
            alt={player.name}
          />
        )}

        <div className="cfb-player-header-info">
          <h1>{player.name}</h1>
          {(player.team || player.class) && (
            <p className="cfb-player-team">
              {player.team}
              {player.team && player.class && " - "}
              {player.class}
            </p>
          )}

          {(player.position || player.jersey) && (
            <p>
              {player.position}
              {player.jersey && ` #${player.jersey}`}
            </p>
          )}
          
          {(player.height || player.weight) && (
            <p>
              {player.height}
              {player.height && player.weight && " · "}
              {player.weight}
            </p>
          )}
        </div>
      </section>

      <section className="cfb-player-season">
        <h2>{stats.season} Season</h2>

        {stats.categories?.length > 0 ? (
          <>
            <div className="cfb-player-stat-tabs">
              {stats.categories.map((category) => (
                <button
                  key={category.name}
                  className={
                    activeCategory === category.name
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveCategory(category.name)
                  }
                >
                  {category.displayName}
                </button>
              ))}
            </div>

            {selectedCategory && (
              <StatTable category={selectedCategory} />
            )}
          </>
        ) : (
          <p>No season statistics available.</p>
        )}
      </section>
    </main>
  );
}