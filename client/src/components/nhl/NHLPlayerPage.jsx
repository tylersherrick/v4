import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

const CATEGORY_ORDER = [
  "general",
  "offensive",
  "defensive",
  "penalties",
];

const SKATER_STATS = {
  general: [
    "games",
    "gameStarted",
    "plusMinus",
    "timeOnIce",
    "timeOnIcePerGame",
    "shifts",
    "shiftsPerGame",
  ],
  offensive: [
    "goals",
    "avgGoals",
    "assists",
    "shotsTotal",
    "avgShots",
    "points",
    "pointsPerGame",
    "powerPlayGoals",
    "powerPlayAssists",
    "shortHandedGoals",
    "shortHandedAssists",
    "shootoutAttempts",
    "shootoutGoals",
    "shootoutShotPct",
    "shootingPct",
    "totalFaceOffs",
    "faceoffsWon",
    "faceoffsLost",
    "faceoffPercent",
    "gameTyingGoals",
    "gameWinningGoals",
  ],
  defensive: [
    "blockedShots",
    "hits",
  ],
  penalties: [
    "penaltyMinutes",
    "majorPenalties",
    "minorPenalties",
    "misconducts",
    "gameMisconducts",
    "boardingPenalties",
    "unsportsmanlikePenalties",
    "fightingPenalties",
    "chargingPenalties",
    "hookingPenalties",
    "trippingPenalties",
    "roughingPenalties",
    "holdingPenalties",
    "interferencePenalties",
    "slashingPenalties",
    "highStickingPenalties",
    "crossCheckingPenalties",
    "elbowingPenalties",
  ],
};

const GOALIE_STATS = {
  general: [
    "games",
    "gameStarted",
    "wins",
    "losses",
    "overtimeLosses",
    "timeOnIce",
    "timeOnIcePerGame",
  ],
  defensive: [
    "goalsAgainst",
    "avgGoalsAgainst",
    "shotsAgainst",
    "saves",
    "savePct",
    "shutouts",
    "evenStrengthSaves",
    "powerPlaySaves",
    "shortHandedSaves",
    "shootoutSaves",
    "shootoutShotsAgainst",
    "shootoutSavePct",
  ],
};

const CATEGORY_NAMES = {
  general: "General",
  offensive: "Offense",
  defensive: "Defense",
  penalties: "Penalties",
};

function formatSeason(season) {
  const endYear = Number(season);

  if (!Number.isFinite(endYear)) {
    return season;
  }

  return `${endYear - 1}-${endYear}`;
}

function hasValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "--" &&
    value !== "-"
  );
}

function getNumericValue(value) {
  const number = Number(
    String(value)
      .replace(/[%,$]/g, "")
      .trim()
  );

  return Number.isNaN(number)
    ? null
    : number;
}

function shouldShowStat(categoryName, statName, value) {
  if (!hasValue(value)) {
    return false;
  }

  const numericValue = getNumericValue(value);

  if (categoryName === "offensive") {
    const pointsPerGameIndex =
      SKATER_STATS.offensive.indexOf(
        "pointsPerGame"
      );

    const statIndex =
      SKATER_STATS.offensive.indexOf(
        statName
      );

    if (
      statIndex > pointsPerGameIndex &&
      numericValue !== null &&
      numericValue === 0
    ) {
      return false;
    }
  }

  if (categoryName === "penalties") {
    const minorPenaltiesIndex =
      SKATER_STATS.penalties.indexOf(
        "minorPenalties"
      );

    const statIndex =
      SKATER_STATS.penalties.indexOf(
        statName
      );

    if (
      statIndex > minorPenaltiesIndex &&
      numericValue !== null &&
      numericValue === 0
    ) {
      return false;
    }
  }

  return true;
}

function sortCategories(categories = []) {
  return [...categories].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(
        a.name?.toLowerCase()
      ) -
      CATEGORY_ORDER.indexOf(
        b.name?.toLowerCase()
      )
  );
}

function cleanCategories(categories = [], isGoalie) {
  const relevantStats = isGoalie
    ? GOALIE_STATS
    : SKATER_STATS;

  const cleanedCategories = categories
    .filter((category) =>
      Object.hasOwn(
        relevantStats,
        category.name?.toLowerCase()
      )
    )
    .map((category) => {
      const categoryName =
        category.name?.toLowerCase();

      const allowedStats =
        relevantStats[categoryName] || [];

      const stats = allowedStats
        .map((statName) =>
          (category.stats || []).find(
            (stat) => stat.name === statName
          )
        )
        .filter(
          (stat) =>
            stat &&
            shouldShowStat(
              categoryName,
              stat.name,
              stat.value
            )
        );

      return {
        ...category,
        displayName:
          CATEGORY_NAMES[categoryName] ||
          category.displayName,
        stats,
      };
    })
    .filter((category) => category.stats.length > 0);

  return sortCategories(cleanedCategories);
}

function formatStatValue(stat) {
  if (
    stat.name === "plusMinus" &&
    Number(stat.value) === 0
  ) {
    return "Even";
  }

  return stat.value;
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
          <strong>{formatStatValue(stat)}</strong>
        </div>
      ))}
    </div>
  );
}

function CareerTable({ seasons, categoryName }) {
  const categorySeasons = seasons
    .map((season) => {
      const category = season.categories.find(
        (item) => item.name === categoryName
      );

      return {
        season: season.season,
        category,
      };
    })
    .filter((season) => season.category)
    .sort(
      (a, b) =>
        Number(b.season) - Number(a.season)
    );

  if (!categorySeasons.length) {
    return <p>No career statistics available.</p>;
  }

  const statNames = [];

  categorySeasons.forEach(({ category }) => {
    category.stats.forEach((stat) => {
      if (!statNames.includes(stat.name)) {
        statNames.push(stat.name);
      }
    });
  });

  const statLabels = {};

  categorySeasons.forEach(({ category }) => {
    category.stats.forEach((stat) => {
      statLabels[stat.name] = stat.displayName;
    });
  });

  return (
    <div className="cfb-player-stat-table">
      <h2>
        {categorySeasons[0].category.displayName}
      </h2>

      {categorySeasons.map(({ season, category }) => (
        <div
          key={season}
          className="nhl-player-career-season"
        >
          <h3>{formatSeason(season)}</h3>

          {statNames.map((statName) => {
            const stat = category.stats.find(
              (item) => item.name === statName
            );

            if (!stat) {
              return null;
            }

            return (
              <div
                className="cfb-player-stat-row"
                key={`${season}-${statName}`}
              >
                <span>{statLabels[statName]}</span>
                <strong>{formatStatValue(stat)}</strong>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function NHLPlayerPage() {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [statView, setStatView] = useState("season");
  const [activeCategory, setActiveCategory] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlayer() {
      try {
        setLoading(true);
        setError("");

        const [playerResponse, statsResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/api/nhl/player/${playerId}`
            ),
            fetch(
              `${API_URL}/api/nhl/player/${playerId}/stats`
            ),
          ]);

        if (!playerResponse.ok || !statsResponse.ok) {
          throw new Error("Unable to load player");
        }

        const [playerData, statsData] =
          await Promise.all([
            playerResponse.json(),
            statsResponse.json(),
          ]);

        const isGoalie =
          playerData.position === "G";

        const currentCategories = cleanCategories(
          statsData.categories,
          isGoalie
        );

        const seasons = (statsData.seasons || [])
          .map((season) => ({
            ...season,
            categories: cleanCategories(
              season.categories,
              isGoalie
            ),
          }))
          .filter(
            (season) =>
              season.categories.length > 0
          )
          .sort(
            (a, b) =>
              Number(b.season) - Number(a.season)
          );

        setPlayer(playerData);

        setStats({
          ...statsData,
          categories: currentCategories,
          seasons,
        });

        setActiveCategory(
          currentCategories[0]?.name ||
            seasons[0]?.categories[0]?.name ||
            ""
        );
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

  if (!player || !stats) {
    return <p>Player not found.</p>;
  }

  const currentCategories =
    stats.categories || [];

  const careerSeasons =
    stats.seasons || [];

  const careerCategoryNames = CATEGORY_ORDER.filter(
    (categoryName) =>
      careerSeasons.some((season) =>
        season.categories.some(
          (category) =>
            category.name === categoryName
        )
      )
  );

  const availableCategoryNames =
    statView === "season"
      ? currentCategories.map(
          (category) => category.name
        )
      : careerCategoryNames;

  const selectedCategoryName =
    availableCategoryNames.includes(activeCategory)
      ? activeCategory
      : availableCategoryNames[0] || "";

  const selectedCurrentCategory =
    currentCategories.find(
      (category) =>
        category.name === selectedCategoryName
    );

  function changeStatView(view) {
    setStatView(view);

    if (view === "season") {
      setActiveCategory(
        currentCategories[0]?.name || ""
      );
      return;
    }

    setActiveCategory(
      careerCategoryNames[0] || ""
    );
  }

  function getCategoryLabel(categoryName) {
    return (
      CATEGORY_NAMES[categoryName] ||
      categoryName
    );
  }

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

        <Link to="/nhl">
          ← Back to Games
        </Link>
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

          {player.team && (
            <p className="cfb-player-team">
              {player.team}
            </p>
          )}

          {(player.positionName ||
            player.position ||
            player.jersey) && (
            <p>
              {player.positionName ||
                player.position}

              {player.jersey &&
                ` #${player.jersey}`}
            </p>
          )}

          {(player.height || player.weight) && (
            <p>
              {player.height}

              {player.height &&
                player.weight &&
                " · "}

              {player.weight}
            </p>
          )}
        </div>
      </section>

      <section className="cfb-player-season">
        <div className="cfb-player-stat-tabs">
          <button
            className={
              statView === "season" ? "active" : ""
            }
            onClick={() =>
              changeStatView("season")
            }
          >
            Current Season
          </button>

          <button
            className={
              statView === "career" ? "active" : ""
            }
            onClick={() =>
              changeStatView("career")
            }
          >
            Career
          </button>
        </div>

        <h2>
          {statView === "season"
            ? `${formatSeason(stats.season)} Season Statistics`
            : "Career Statistics"}
        </h2>

        {availableCategoryNames.length > 0 ? (
          <>
            <div className="cfb-player-stat-tabs">
              {availableCategoryNames.map(
                (categoryName) => (
                  <button
                    key={categoryName}
                    className={
                      selectedCategoryName ===
                      categoryName
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveCategory(
                        categoryName
                      )
                    }
                  >
                    {getCategoryLabel(
                      categoryName
                    )}
                  </button>
                )
              )}
            </div>

            {statView === "season" &&
              selectedCurrentCategory && (
                <StatTable
                  category={
                    selectedCurrentCategory
                  }
                />
              )}

            {statView === "career" &&
              selectedCategoryName && (
                <CareerTable
                  seasons={careerSeasons}
                  categoryName={
                    selectedCategoryName
                  }
                />
              )}
          </>
        ) : (
          <p>No statistics available.</p>
        )}
      </section>
    </main>
  );
}