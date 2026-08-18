import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MLBPlayerStats from "./MLBPlayerStats.jsx";
import MLBCareerTotals from "./MLBCareerTotals.jsx";
import MLBCareerFielding from "./MLBCareerFielding.jsx";
import MLBPlayerNews from "./MLBPlayerNews.jsx";

const API_URL = "https://v4-vqu0.onrender.com";

export default function MLBPlayerPage() {
  const { playerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const playerName = location.state?.playerName;
  const team = location.state?.team;
  const position = location.state?.position;
  const jersey = location.state?.jersey;
  const headshot = location.state?.headshot;

  const [stats, setStats] = useState(null);
  const [player, setPlayer] = useState(null);
  const [view, setView] = useState("current");
  const [hasCurrentSeason, setHasCurrentSeason] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlayer() {
      try {
        const [statsResponse, playerResponse] = await Promise.all([
          fetch(
            `${API_URL}/api/mlb/player/${playerId}/stats`
          ),
          fetch(
            `${API_URL}/api/mlb/player/${playerId}`
          ),
        ]);

        if (!statsResponse.ok || !playerResponse.ok) {
          throw new Error("Unable to load player");
        }

        const [statsData, playerData] = await Promise.all([
          statsResponse.json(),
          playerResponse.json(),
        ]);

        const allSeasons = [
          ...(statsData.batting?.career || []),
          ...(statsData.pitching?.career || []),
          ...(statsData.fielding?.career || []),
        ];

        const mostRecentYear = Math.max(
          ...allSeasons
            .map((season) => Number(season.year))
            .filter(Boolean)
        );

        const currentYear = new Date().getFullYear();
        const isCurrent = mostRecentYear === currentYear;

        setStats(statsData);
        setPlayer(playerData);
        setHasCurrentSeason(isCurrent);
        setView(isCurrent ? "current" : "career");
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

  const hasBatting =
    stats.batting?.currentSeason?.length > 0;

  const hasPitching =
    stats.pitching?.currentSeason?.length > 0;

  const hasFielding =
    stats.fielding?.currentSeason?.length > 0;

  const battingCareer = [...(stats.batting?.career || [])].sort(
    (a, b) => b.year - a.year
  );

  const pitchingCareer = [...(stats.pitching?.career || [])].sort(
    (a, b) => b.year - a.year
  );

  const fieldingCareer = [...(stats.fielding?.career || [])].sort(
    (a, b) => b.year - a.year
  );

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

      {headshot && (
        <img
          src={headshot}
          alt={playerName}
          width="125"
        />
      )}

      <h1>{playerName || `Player ${playerId}`}</h1>

      {team && <p>{team}</p>}

      {(position || jersey) && (
        <p>
          {position}
          {jersey && ` #${jersey}`}
        </p>
      )}

      {hasCurrentSeason && (
        <button onClick={() => setView("current")}>
          Current Season
        </button>
      )}

      <button onClick={() => setView("career")}>
        Career
      </button>

      {view === "current" && (
        <>
          {hasBatting && (
            <MLBPlayerStats
              title="Current Season Batting"
              seasons={stats.batting.currentSeason}
            />
          )}

          {hasPitching && (
            <MLBPlayerStats
              title="Current Season Pitching"
              seasons={stats.pitching.currentSeason}
            />
          )}

          {hasFielding && (
            <MLBPlayerStats
              title="Current Season Fielding"
              seasons={stats.fielding.currentSeason}
            />
          )}
        </>
      )}

      {view === "career" && (
        <>
          <MLBCareerTotals
            title="Career Batting Totals"
            stats={stats.batting?.careerTotals}
          />

          <MLBCareerTotals
            title="Career Pitching Totals"
            stats={stats.pitching?.careerTotals}
          />

          <MLBCareerFielding
            positions={stats.fielding?.careerByPosition}
          />

          {battingCareer.length > 0 && (
            <MLBPlayerStats
              title="Batting by Season"
              seasons={battingCareer}
            />
          )}

          {pitchingCareer.length > 0 && (
            <MLBPlayerStats
              title="Pitching by Season"
              seasons={pitchingCareer}
            />
          )}

          {fieldingCareer.length > 0 && (
            <MLBPlayerStats
              title="Fielding by Season"
              seasons={fieldingCareer}
            />
          )}
        </>
      )}

      <MLBPlayerNews news={player.news} />
    </main>
  );
}