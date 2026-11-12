
import { useEffect, useState } from "react";

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl";

const propMarkets = {
  skater: [
    { id: "shots", label: "Shots on Goal" },
    { id: "goals", label: "Goals" },
    { id: "assists", label: "Assists" },
    { id: "points", label: "Points" },
    { id: "blocked_shots", label: "Blocked Shots" },
    { id: "time_on_ice", label: "Time on Ice" },
  ],
  goalie: [
    { id: "saves", label: "Saves" },
    { id: "goals_allowed", label: "Goals Allowed" },
    { id: "time_on_ice", label: "Time on Ice" },
  ],
};

const positionGroups = [
  { id: "forward", label: "Forwards" },
  { id: "defense", label: "Defensemen" },
  { id: "goalie", label: "Goalies" },
];

function getPositionGroup(position) {
  const value = String(position || "").toUpperCase();

  if (["G", "GK"].includes(value)) return "goalie";
  if (["D", "LD", "RD"].includes(value)) return "defense";

  return "forward";
}

function normalizePlayer(athlete, team) {
  return {
    id: String(athlete.id),
    name: athlete.displayName || athlete.fullName,
    team,
    position: athlete.position?.abbreviation || "",
    group: getPositionGroup(athlete.position?.abbreviation),
  };
}

function extractRoster(data, team) {
  return (data.athletes || []).flatMap((group) => {
    const athletes = group.items || group.athletes || [];

    return athletes
      .map((item) => normalizePlayer(item.athlete || item, team))
      .filter((player) => player.id && player.name);
  });
}

function parseTimeOnIce(value) {
  if (value.trim() === "") {
    return null;
  }

  const minutes = Number(value);

  if (
    !Number.isFinite(minutes) ||
    minutes < 0 ||
    !Number.isInteger(minutes * 4)
  ) {
    return null;
  }

  return Math.round(minutes * 60);
}

export default function PlayerPropSelector({ game, onMarketSelect }) {
  const [players, setPlayers] = useState([]);
  const [positionGroup, setPositionGroup] = useState("forward");
  const [playerId, setPlayerId] = useState("");
  const [market, setMarket] = useState("shots");
  const [direction, setDirection] = useState("over");
  const [line, setLine] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      setLoading(true);
      setError("");
      setPlayers([]);
      setPlayerId("");

      try {
        const response = await fetch(
          `${ESPN_URL}/summary?event=${encodeURIComponent(game.id)}`
        );

        if (!response.ok) {
          throw new Error("Unable to load game information");
        }

        const summary = await response.json();
        const competitors =
          summary.header?.competitions?.[0]?.competitors || [];

        const rosters = await Promise.all(
          competitors.map(async (competitor) => {
            const teamId = competitor.team?.id;
            const abbreviation = competitor.team?.abbreviation;

            if (!teamId) return [];

            const rosterResponse = await fetch(
              `${ESPN_URL}/teams/${teamId}/roster`
            );

            if (!rosterResponse.ok) {
              throw new Error(
                `Unable to load ${abbreviation} roster`
              );
            }

            const roster = await rosterResponse.json();

            return extractRoster(roster, abbreviation);
          })
        );

        if (cancelled) return;

        const uniquePlayers = Array.from(
          new Map(
            rosters.flat().map((player) => [player.id, player])
          ).values()
        );

        uniquePlayers.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setPlayers(uniquePlayers);

        if (uniquePlayers.length === 0) {
          setError("No players found for this game");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (game.league?.toLowerCase() === "nhl") {
      loadPlayers();
    }

    return () => {
      cancelled = true;
    };
  }, [game.id, game.league]);

  function resetSelection() {
    onMarketSelect(null);
  }

  function changePositionGroup(value) {
    setPositionGroup(value);
    setPlayerId("");
    setMarket(value === "goalie" ? "saves" : "shots");
    setLine("");
    resetSelection();
  }

  function changePlayer(value) {
    setPlayerId(value);
    setLine("");
    resetSelection();
  }

  function changeMarket(value) {
    setMarket(value);
    setLine("");
    resetSelection();
  }

  function addSelection() {
    const player = players.find((item) => item.id === playerId);

    if (!player || !validLine) {
      return;
    }

    const bettingLine =
      market === "time_on_ice"
        ? parseTimeOnIce(line)
        : Number(line);

    onMarketSelect({
      gameId: game.id,
      league: game.league,
      category: "player",
      market,
      playerId: player.id,
      playerName: player.name,
      playerTeam: player.team,
      team: null,
      direction,
      line: bettingLine,
      awayTeam: game.awayTeam.abbreviation,
      homeTeam: game.homeTeam.abbreviation,
      gameDate: game.date,
    });
  }

  const filteredPlayers = players.filter(
    (player) => player.group === positionGroup
  );

  const availableMarkets =
    positionGroup === "goalie"
      ? propMarkets.goalie
      : propMarkets.skater;

  const isTimeOnIce = market === "time_on_ice";

  const validLine = isTimeOnIce
    ? parseTimeOnIce(line) !== null
    : line.trim() !== "" &&
      Number.isFinite(Number(line)) &&
      Number(line) >= 0;

  if (game.league?.toLowerCase() !== "nhl") {
    return <p>Player props for this league are coming later.</p>;
  }

  return (
    <div className="sweatzone-player-prop-selector">
      <h3>Choose a Position</h3>

      <div className="sweatzone-market-types">
        {positionGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            className={positionGroup === group.id ? "active" : ""}
            onClick={() => changePositionGroup(group.id)}
          >
            {group.label}
          </button>
        ))}
      </div>

      <h3>Choose a Player</h3>

      {loading && <p>Loading players...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div
          className="sweatzone-player-list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {filteredPlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              className={
                playerId === player.id ? "selected" : ""
              }
              onClick={() => changePlayer(player.id)}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                borderRadius: "8px",
                border:
                  playerId === player.id
                    ? "2px solid #22c55e"
                    : "1px solid #374151",
                background:
                  playerId === player.id
                    ? "rgba(34, 197, 94, 0.12)"
                    : "transparent",
                cursor: "pointer",
              }}
            >
              <strong>{player.name}</strong>
              <span style={{ marginLeft: "8px", opacity: 0.7 }}>
                {player.team} · {player.position}
              </span>
            </button>
          ))}

          {filteredPlayers.length === 0 && (
            <p>No players available in this position.</p>
          )}
        </div>
      )}

      {playerId && (
        <>
          <h3>Choose a Prop</h3>

          <div className="sweatzone-market-types">
            {availableMarkets.map((item) => (
              <button
                key={item.id}
                type="button"
                className={market === item.id ? "active" : ""}
                onClick={() => changeMarket(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="sweatzone-market-teams">
            <button
              type="button"
              className={direction === "over" ? "selected" : ""}
              onClick={() => {
                setDirection("over");
                resetSelection();
              }}
            >
              Over
            </button>

            <button
              type="button"
              className={direction === "under" ? "selected" : ""}
              onClick={() => {
                setDirection("under");
                resetSelection();
              }}
            >
              Under
            </button>
          </div>

          <label className="sweatzone-market-line">
            Betting Line
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step={isTimeOnIce ? "0.25" : "0.5"}
              placeholder={
                isTimeOnIce
                  ? "22.5"
                  : market === "saves"
                    ? "25.5"
                    : "2.5"
              }
              value={line}
              onChange={(event) => {
                setLine(event.target.value);
                resetSelection();
              }}
            />
          </label>

          {isTimeOnIce && (
            <p>
              Enter decimal minutes in 0.25 increments
              (e.g. 22.25, 22.5, 22.75).
            </p>
          )}

          <button
            type="button"
            className="sweatzone-add-button"
            disabled={!validLine}
            onClick={addSelection}
          >
            Add Selection
          </button>
        </>
      )}
    </div>
  );
}
