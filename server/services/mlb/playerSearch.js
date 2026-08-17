export async function searchPlayers(name) {
  const url =
    `https://site.web.api.espn.com/apis/search/v2` +
    `?query=${encodeURIComponent(name)}` +
    `&sport=baseball` +
    `&limit=10`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();

  const playerGroup = data.results?.find(
    (result) => result.type === "player"
  );

  if (!playerGroup?.contents?.length) {
    return [];
  }

  return playerGroup.contents
    .filter(
      (player) =>
        player.defaultLeagueSlug === "mlb"
    )
    .map((player) => ({
      id:
        player.uid?.split("~a:")[1] || null,
      name: player.displayName,
      team: player.subtitle || null,
      headshot:
        player.image?.default || null,
    }));
}