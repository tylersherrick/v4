const GAME_ID = "401816132";

function getDateKey(date, timeZone = "America/Chicago") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}${month}${day}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function printStatLine(labels, stats) {
  if (!labels?.length || !stats?.length) {
    console.log("No game stats available.");
    return;
  }

  console.log(
    labels
      .map((label, index) => `${label}: ${stats[index] ?? "-"}`)
      .join(" | ")
  );
}

async function getGameData() {
  const startTime = performance.now();

  try {
    const url =
      `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary` +
      `?event=${GAME_ID}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ESPN request failed: ${response.status}`);
    }

    const data = await response.json();

    const competition = data.header?.competitions?.[0];

    if (!competition?.date) {
      throw new Error("Game date not found.");
    }

    const gameDate = new Date(competition.date);
    const today = new Date();

    const gameDateKey = getDateKey(gameDate);
    const todayDateKey = getDateKey(today);

    const isPastGame = gameDateKey < todayDateKey;

    console.log("\n======================================");
    console.log(`GAME ID: ${GAME_ID}`);
    console.log(`DATE: ${formatDate(gameDate)}`);
    console.log(
      `GAME TYPE: ${isPastGame ? "PAST GAME" : "CURRENT / FUTURE GAME"}`
    );
    console.log("======================================");

    console.log("\n======================================");
    console.log("INNING BY INNING");
    console.log("======================================");

    const teams = competition.competitors || [];

    const awayTeam = teams.find(
    (team) => team.homeAway === "away"
    );

    const homeTeam = teams.find(
    (team) => team.homeAway === "home"
    );

    const awayLinescores = awayTeam?.linescores || [];
    const homeLinescores = homeTeam?.linescores || [];

    const inningCount = Math.max(
    awayLinescores.length,
    homeLinescores.length
    );

    if (!inningCount) {
    console.log("No inning-by-inning scoring available.");
    } else {
    const innings = [];

    for (let i = 0; i < inningCount; i++) {
        innings.push(i + 1);
    }

    console.log(
        `TEAM | ${innings.join(" | ")} | R`
    );

    console.log(
        `${awayTeam.team.abbreviation}${" "} | ` +
        innings
            .map(
            (_, index) =>
                awayLinescores[index]?.displayValue ??
                awayLinescores[index]?.value ??
                "-"
            )
            .join(" | ") +
        ` | ${awayTeam.score ?? "-"}`
    );

    console.log(
        `${homeTeam.team.abbreviation}${" "} | ` +
        innings
            .map(
            (_, index) =>
                homeLinescores[index]?.displayValue ??
                homeLinescores[index]?.value ??
                "-"
            )
            .join(" | ") +
        ` | ${homeTeam.score ?? "-"}`
    );
    }

    if (isPastGame) {
      console.log("\n======================================");
      console.log("PITCHERS USED");
      console.log("======================================");

      if (!data.boxscore?.players?.length) {
        console.log("No pitching data available.");
      } else {
        data.boxscore.players.forEach((teamData) => {
          console.log(
            `\n${teamData.team.displayName} (${teamData.team.abbreviation})`
          );
          console.log("--------------------------------------");

          const pitching = teamData.statistics?.find(
            (stat) => stat.type === "pitching"
          );

          if (!pitching?.athletes?.length) {
            console.log("No pitching data available.");
            return;
          }

          pitching.athletes.forEach((pitcher) => {
            console.log(
              `\n${pitcher.athlete.displayName} | ` +
                `${pitcher.starter ? "STARTER" : "RELIEF"} | ` +
                `ID: ${pitcher.athlete.id}`
            );

            printStatLine(pitching.labels, pitcher.stats);
          });
        });
      }
    } else {
      console.log("\n======================================");
      console.log("PROBABLE STARTING PITCHERS");
      console.log("======================================");

      const competitors = competition.competitors || [];

      competitors.forEach((teamData) => {
        const team = teamData.team;

        console.log(
          `\n${team.displayName} (${team.abbreviation})`
        );
        console.log("--------------------------------------");

        const probable =
          teamData.probables?.find(
            (player) =>
              player.name === "probableStartingPitcher"
          ) || teamData.probables?.[0];

        if (!probable?.athlete) {
          console.log("No probable starter available.");
          return;
        }

        console.log(
          `${probable.athlete.displayName} | ` +
            `${probable.athlete.position?.abbreviation || "SP"} | ` +
            `${probable.record || ""} | ` +
            `ID: ${probable.athlete.id}`
        );
      });
    }

    console.log("\n======================================");
    console.log("STARTING LINEUPS");
    console.log("======================================");

    if (!data.boxscore?.players?.length) {
      console.log("No lineup data available.");
    } else {
      data.boxscore.players.forEach((teamData) => {
        console.log(
          `\n${teamData.team.displayName} (${teamData.team.abbreviation})`
        );
        console.log("--------------------------------------");

        const batting = teamData.statistics?.find(
          (stat) => stat.type === "batting"
        );

        if (!batting?.athletes) {
          console.log("No batting lineup available.");
          return;
        }

        const starters = batting.athletes
          .filter(
            (player) =>
              player.starter === true &&
              player.batOrder != null &&
              player.batOrder > 0
          )
          .sort((a, b) => a.batOrder - b.batOrder);

        starters.forEach((player) => {
          console.log(
            `\n${player.batOrder}. ${player.athlete.displayName} | ` +
              `${player.position?.abbreviation || "N/A"} | ` +
              `ID: ${player.athlete.id}`
          );

          if (isPastGame) {
            printStatLine(batting.labels, player.stats);
          }
        });
      });
    }

    if (isPastGame) {
      console.log("\n======================================");
      console.log("INJURIES");
      console.log("======================================");
      console.log(
        "Not shown for past games because ESPN injury data reflects current player status."
      );
    } else {
      console.log("\n======================================");
      console.log("INJURIES / PLAYER STATUS");
      console.log("======================================");

      if (!data.injuries?.length) {
        console.log("No injury data available.");
      } else {
        data.injuries.forEach((teamData) => {
          console.log(
            `\n${teamData.team.displayName} (${teamData.team.abbreviation})`
          );
          console.log("--------------------------------------");

          if (!teamData.injuries?.length) {
            console.log("No injuries.");
            return;
          }

          teamData.injuries.forEach((injury) => {
            const player = injury.athlete;

            console.log(
              `${player?.displayName || "Unknown Player"} | ` +
                `${injury.status || "Unknown Status"} | ` +
                `${injury.details?.type || injury.type || "N/A"} | ` +
                `ID: ${player?.id || "N/A"}`
            );
          });
        });
      }
    }

    const endTime = performance.now();

    console.log("\n======================================");
    console.log(
      `TOTAL RUNTIME: ${((endTime - startTime) / 1000).toFixed(2)} seconds`
    );
    console.log("======================================");
  } catch (error) {
    console.error(error);
  }
}

getGameData();