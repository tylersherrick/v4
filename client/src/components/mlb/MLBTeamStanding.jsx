import { Link } from "react-router-dom";

export default function MLBTeamStanding({ standings, teamId }) {
  const teamStanding = standings.find(
    (team) => String(team.id) === String(teamId)
  );

  if (!teamStanding) {
    return null;
  }

  const divisionTeams = standings.filter(
    (team) =>
      team.division === teamStanding.division
  );

  const leagueTeams = standings
    .filter(
      (team) =>
        team.league === teamStanding.league
    )
    .sort(
      (a, b) =>
        Number(b.winPercent) - Number(a.winPercent)
    );

  const leagueRank =
    leagueTeams.findIndex(
      (team) => String(team.id) === String(teamId)
    ) + 1;

  function getOrdinal(number) {
    if (number === 1) return "1st";
    if (number === 2) return "2nd";
    if (number === 3) return "3rd";
    return `${number}th`;
  }

  return (
    <section className="mlb-team-standing">
      <h2>Standings</h2>

      <p>
        {getOrdinal(teamStanding.divisionRank)} in{" "}
        {teamStanding.division}
        {leagueRank > 0 && (
          <>
            {" "}• {getOrdinal(leagueRank)} in{" "}
            {teamStanding.league}
          </>
        )}
      </p>

      <p>
        {teamStanding.wins}-{teamStanding.losses}
      </p>

      {teamStanding.gamesBehind != null && (
        <p>
          Games Behind: {teamStanding.gamesBehind}
        </p>
      )}

      <h3>{teamStanding.division} Standings</h3>

      {divisionTeams.map((team, index) => (
        <div
          key={team.id}
          className={`mlb-team-standing-team ${
            String(team.id) === String(teamId)
              ? "current"
              : ""
          }`}
        >
          <span>{index + 1}. </span>

          <Link to={`/mlb/team/${team.id}`}>
            {team.name}
          </Link>

          <span>
            {" "}
            {team.wins}-{team.losses}
          </span>

          <span>
            {" "}GB: {team.gamesBehind}
          </span>
        </div>
      ))}
    </section>
  );
}