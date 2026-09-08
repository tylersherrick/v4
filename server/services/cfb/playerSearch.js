const SEARCH_URL =
  "https://site.web.api.espn.com/apis/search/v2";

const CFB_ATHLETE_URL =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/athletes";

async function fetchJson(url) {
  const response = await fetch(
    url.replace("http://", "https://")
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function searchPlayers(name) {
  const url =
    `${SEARCH_URL}` +
    `?query=${encodeURIComponent(name)}` +
    `&sport=football` +
    `&limit=10`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();

  const playerGroup = data.results?.find(
    (result) => result.type === "player"
  );

  if (!playerGroup?.contents?.length) {
    return [];
  }

  const players = await Promise.all(
    playerGroup.contents.map(async (player) => {
      const id =
        player.uid?.split("~a:")[1] || null;

      if (!id) {
        return null;
      }

      const athlete = await fetchJson(
        `${CFB_ATHLETE_URL}/${id}?lang=en&region=us`
      );

      if (!athlete?.id) {
        return null;
      }

      let team = null;

      if (athlete.team?.$ref) {
        const teamData = await fetchJson(
          athlete.team.$ref
        );

        team =
          teamData?.displayName ||
          teamData?.name ||
          null;
      }

      return {
        id: athlete.id,
        name: athlete.displayName,
        team,
        headshot:
          athlete.headshot?.href || null,
      };
    })
  );

  return players.filter(Boolean);
}