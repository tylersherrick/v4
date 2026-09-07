const RANKINGS_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings";

const CORE_URL =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football";

const TEAM_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams";

const CONFERENCES = {
  1: "ACC",
  4: "Big 12",
  5: "Big Ten",
  8: "SEC",
  9: "Pac-12",
  12: "Conference USA",
  15: "MAC",
  17: "Mountain West",
  18: "FBS Independents",
  37: "Sun Belt",
  151: "AAC",
};

export async function getRankings() {
  const response = await fetch(RANKINGS_URL);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();

  const apPoll = data.rankings?.find(
    (poll) =>
      poll.name === "AP Top 25" ||
      poll.shortName === "AP Poll"
  );

  if (!apPoll) {
    return {
      name: "AP Top 25",
      teams: [],
    };
  }

  return {
    name: apPoll.name || "AP Top 25",
    teams:
      apPoll.ranks?.map((rank) => ({
        rank: rank.current,
        previousRank: rank.previous || null,
        points: rank.points || null,
        firstPlaceVotes: rank.firstPlaceVotes || 0,
        record: rank.recordSummary || null,
        team: {
          id: rank.team?.id || null,
          name:
            rank.team?.location && rank.team?.name
              ? `${rank.team.location} ${rank.team.name}`
              : rank.team?.nickname || null,
          abbreviation: rank.team?.abbreviation || null,
          conference: rank.team?.groups?.shortName || null,
          conferenceId: rank.team?.groups?.id || null,
          logo:
            rank.team?.logo ||
            rank.team?.logos?.[0]?.href ||
            null,
        },
      })) || [],
  };
}

export async function getConferenceTeams(conferenceId) {
  const season = new Date().getFullYear();

  const [conferenceResponse, rankings] = await Promise.all([
    fetch(
      `${CORE_URL}/seasons/${season}/types/2/groups/${conferenceId}/teams?limit=100`
    ),
    getRankings(),
  ]);

  if (!conferenceResponse.ok) {
    throw new Error(
      `ESPN request failed: ${conferenceResponse.status}`
    );
  }

  const data = await conferenceResponse.json();

  const teamIds =
    data.items
      ?.map((item) => {
        const ref = item.$ref || "";
        const match = ref.match(/\/teams\/(\d+)/);

        return match?.[1] || null;
      })
      .filter(Boolean) || [];

  const rankMap = new Map(
    rankings.teams.map((item) => [
      String(item.team.id),
      item.rank,
    ])
  );

  const teams = await Promise.all(
    teamIds.map(async (teamId) => {
      const teamResponse = await fetch(
        `${TEAM_URL}/${teamId}`
      );

      if (!teamResponse.ok) {
        return null;
      }

      const data = await teamResponse.json();
      const team = data.team;

      return {
        id: team?.id || teamId,
        name: team?.displayName || null,
        abbreviation: team?.abbreviation || null,
        logo:
          team?.logos?.[0]?.href ||
          team?.logo ||
          null,
        rank: rankMap.get(String(teamId)) || null,
      };
    })
  );

  const sortedTeams = teams
    .filter(Boolean)
    .sort((a, b) => {
      if (a.rank && b.rank) {
        return a.rank - b.rank;
      }

      if (a.rank) {
        return -1;
      }

      if (b.rank) {
        return 1;
      }

      return (a.name || "").localeCompare(b.name || "");
    });

  return {
    id: conferenceId,
    name: CONFERENCES[conferenceId] || null,
    teams: sortedTeams,
  };
}