const API_URL = "https://v4-vqu0.onrender.com";

function formatApiDate(date) {
  return date.replaceAll("-", "");
}

export async function getMLBGames(date) {
  const response = await fetch(
    `${API_URL}/api/mlb/games?date=${formatApiDate(date)}`
  );

  if (!response.ok) {
    throw new Error("Unable to load games");
  }

  const data = await response.json();

  const statusOrder = {
    in: 0,
    pre: 1,
    post: 2,
  };

  return [...data].sort(
    (a, b) =>
      (statusOrder[a.status?.state] ?? 1) -
      (statusOrder[b.status?.state] ?? 1)
  );
}