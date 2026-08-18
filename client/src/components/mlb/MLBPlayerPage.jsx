import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import MLBPlayerStats from "./MLBPlayerStats.jsx";
import MLBCareerTotals from "./MLBCareerTotals.jsx";
import MLBCareerFielding from "./MLBCareerFielding.jsx";
import MLBPlayerNews from "./MLBPlayerNews.jsx";

const API_URL = "https://v4-vqu0.onrender.com";

export default function MLBPlayerPage() {
  const { playerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const playerName = location.state?.playerName;
  const team = location.state?.team;
  const position = location.state?.position;
  const jersey = location.state?.jersey;
  const headshot = location.state?.headshot;

  const [stats, setStats] = useState(null);
  const [player, setPlayer] = useState(null);
  const [view, setView] = useState(
    searchParams.get("view") || "current"
  );
  const [statType, setStatType] = useState(
    searchParams.get("stat") || "batting"
  );
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

        if (!searchParams.get("view")) {
          setView(isCurrent ? "current" : "career");
        }
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

  function changeView(newView) {
    setView(newView);

    const params = new URLSearchParams(searchParams);
    params.set("view", newView);

    navigate(
      {
        search: `?${params.toString()}`,
      },
      {
        replace: true,
        state: location.state,
      }
    );
  }

  function changeStatType(newStatType) {
    setStatType(newStatType);

    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    params.set("stat", newStatType);

    navigate(
      {
        search: `?${params.toString()}`,
      },
      {
        replace: true,
        state: location.state,
      }
    );
  }

  return (
    <main className="mlb-player-page">
      <div className="mlb-player-nav">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            navigate(-1);
          }}
        >
          ← Back
        </a>

        <Link to="/">← Back to Games</Link>
      </div>

      <section className="mlb-player-header">
        {headshot && (
          <img
            className="mlb-player-headshot"
            src={headshot}
            alt={playerName}
          />
        )}

        <div className="mlb-player-header-info">
          <h1>{playerName || `Player ${playerId}`}</h1>

          {team && <p>{team}</p>}

          {(position || jersey) && (
            <p>
              {position}
              {jersey && ` #${jersey}`}
            </p>
          )}
        </div>
      </section>

      <div className="mlb-player-view-tabs">
        {hasCurrentSeason && (
          <button
            className={view === "current" ? "active" : ""}
            onClick={() => changeView("current")}
          >
            Current Season
          </button>
        )}

        <button
          className={view === "career" ? "active" : ""}
          onClick={() => changeView("career")}
        >
          Career
        </button>

        <button
          className={view === "news" ? "active" : ""}
          onClick={() => changeView("news")}
        >
          News
        </button>
      </div>

      {view !== "news" && (
        <div className="mlb-player-stat-tabs">
          {((view === "current" && hasBatting) ||
            (view === "career" && battingCareer.length > 0)) && (
            <button
              className={
                statType === "batting" ? "active" : ""
              }
              onClick={() => changeStatType("batting")}
            >
              Batting
            </button>
          )}

          {((view === "current" && hasPitching) ||
            (view === "career" && pitchingCareer.length > 0)) && (
            <button
              className={
                statType === "pitching" ? "active" : ""
              }
              onClick={() => changeStatType("pitching")}
            >
              Pitching
            </button>
          )}

          {((view === "current" && hasFielding) ||
            (view === "career" && fieldingCareer.length > 0)) && (
            <button
              className={
                statType === "fielding" ? "active" : ""
              }
              onClick={() => changeStatType("fielding")}
            >
              Fielding
            </button>
          )}
        </div>
      )}

      <section className="mlb-player-stats">
        {view === "current" && statType === "batting" && hasBatting && (
          <MLBPlayerStats
            title="Current Season Batting"
            seasons={stats.batting.currentSeason}
          />
        )}

        {view === "current" && statType === "pitching" && hasPitching && (
          <MLBPlayerStats
            title="Current Season Pitching"
            seasons={stats.pitching.currentSeason}
          />
        )}

        {view === "current" && statType === "fielding" && hasFielding && (
          <MLBPlayerStats
            title="Current Season Fielding"
            seasons={stats.fielding.currentSeason}
          />
        )}

        {view === "career" && statType === "batting" && (
          <>
            <MLBCareerTotals
              title="Career Batting Totals"
              stats={stats.batting?.careerTotals}
            />

            {battingCareer.length > 0 && (
              <MLBPlayerStats
                title="Batting by Season"
                seasons={battingCareer}
              />
            )}
          </>
        )}

        {view === "career" && statType === "pitching" && (
          <>
            <MLBCareerTotals
              title="Career Pitching Totals"
              stats={stats.pitching?.careerTotals}
            />

            {pitchingCareer.length > 0 && (
              <MLBPlayerStats
                title="Pitching by Season"
                seasons={pitchingCareer}
              />
            )}
          </>
        )}

        {view === "career" && statType === "fielding" && (
          <>
            <MLBCareerFielding
              positions={stats.fielding?.careerByPosition}
            />

            {fieldingCareer.length > 0 && (
              <MLBPlayerStats
                title="Fielding by Season"
                seasons={fieldingCareer}
              />
            )}
          </>
        )}

        {view === "news" && (
          <MLBPlayerNews news={player.news} />
        )}
      </section>
    </main>
  );
}