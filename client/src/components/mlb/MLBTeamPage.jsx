import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MLBRoster from "./MLBRoster.jsx";
import MLBTeamSchedule from "./MLBTeamSchedule.jsx";
import MLBTeamStanding from "./MLBTeamStanding.jsx";
import MLBTeamLeaders from "./MLBTeamLeaders.jsx";

const API_URL = "https://v4-vqu0.onrender.com";

export default function MLBTeamPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [standings, setStandings] = useState([]);
  const [leaders, setLeaders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeam() {
      setLoading(true);
      setError("");
      setTeam(null);
      setRoster([]);
      setSchedule([]);
      setLeaders(null);

      try {
        const [
          teamResponse,
          rosterResponse,
          scheduleResponse,
          standingsResponse,
          leadersResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/api/mlb/team/${teamId}`),
          fetch(`${API_URL}/api/mlb/team/${teamId}/roster`),
          fetch(`${API_URL}/api/mlb/teams/${teamId}/schedule`),
          fetch(`${API_URL}/api/mlb/standings`),
          fetch(`${API_URL}/api/mlb/team/${teamId}/leaders`),
        ]);

        if (
          !teamResponse.ok ||
          !rosterResponse.ok ||
          !scheduleResponse.ok ||
          !standingsResponse.ok ||
          !leadersResponse.ok
        ) {
          throw new Error("Unable to load team");
        }

        const [
          teamData,
          rosterData,
          scheduleData,
          standingsData,
          leadersData,
        ] = await Promise.all([
          teamResponse.json(),
          rosterResponse.json(),
          scheduleResponse.json(),
          standingsResponse.json(),
          leadersResponse.json(),
        ]);

        setTeam(teamData);
        setRoster(rosterData.players || []);
        setSchedule(scheduleData);
        setStandings(standingsData);
        setLeaders(leadersData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [teamId]);

  if (loading) {
    return <p>Loading team...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const liveGame = schedule.find(
    (game) => game.status?.state === "in"
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

      <h1>{team.displayName}</h1>

      <nav>
        <a href="#overview">Overview</a>{" "}
        <Link to={`/mlb/team/${teamId}/schedule`}>
          Schedule
        </Link>{" "}
        <a href="#roster">Roster</a>
      </nav>

      <section id="overview">
        {team.logo && (
          <img
            src={team.logo}
            alt={team.displayName}
            width="100"
          />
        )}

        <p>{team.abbreviation}</p>

        {team.record?.overall && (
          <p>Record: {team.record.overall}</p>
        )}

        {liveGame && (
          <div>
            <strong>Live Now</strong>
            <br />

            <Link to={`/mlb/game/${liveGame.id}`}>
              Tune In →{" "}
              {liveGame.homeAway === "home" ? "vs" : "at"}{" "}
              {liveGame.opponent.abbreviation}
            </Link>

            <p>{liveGame.status.detail}</p>
          </div>
        )}

        <MLBTeamStanding
          standings={standings}
          teamId={teamId}
        />

        <MLBTeamLeaders leaders={leaders} />
      </section>

      <MLBTeamSchedule
        games={schedule}
        teamId={teamId}
      />

      <div id="roster">
        <MLBRoster players={roster} />
      </div>
    </main>
  );
}