import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import MLBRoster from "./MLBRoster.jsx";
import MLBTeamSchedule from "./MLBTeamSchedule.jsx";
import MLBTeamStanding from "./MLBTeamStanding.jsx";
import MLBTeamLeaders from "./MLBTeamLeaders.jsx";

const API_URL = "https://v4-vqu0.onrender.com";

export default function MLBTeamPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [standings, setStandings] = useState([]);
  const [leaders, setLeaders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeTab = searchParams.get("tab") || "overview";

  function setActiveTab(tab) {
    const params = new URLSearchParams();

    if (tab !== "overview") {
      params.set("tab", tab);
    }

    setSearchParams(params);
  }

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

  return (
    <main className="mlb-team-page">
      <div className="mlb-team-nav">
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

      <section className="mlb-team-header">
        {team.logo && (
          <img
            className="mlb-team-logo"
            src={team.logo}
            alt={team.displayName}
          />
        )}

        <div className="mlb-team-header-info">
          <h1>{team.displayName}</h1>

          <p>{team.abbreviation}</p>

          {team.record?.overall && (
            <p>Record: {team.record.overall}</p>
          )}
        </div>
      </section>

      <nav className="mlb-team-tabs">
        <a
          href="#overview"
          className={
            activeTab === "overview" ? "active" : ""
          }
          onClick={(event) => {
            event.preventDefault();
            setActiveTab("overview");
          }}
        >
          Overview
        </a>

        <a
          href="#schedule"
          className={
            activeTab === "schedule" ? "active" : ""
          }
          onClick={(event) => {
            event.preventDefault();
            setActiveTab("schedule");
          }}
        >
          Schedule
        </a>

        <a
          href="#roster"
          className={
            activeTab === "roster" ? "active" : ""
          }
          onClick={(event) => {
            event.preventDefault();
            setActiveTab("roster");
          }}
        >
          Roster
        </a>

        <a
          href="#leaders"
          className={
            activeTab === "leaders" ? "active" : ""
          }
          onClick={(event) => {
            event.preventDefault();
            setActiveTab("leaders");
          }}
        >
          Leaders
        </a>
      </nav>

      {activeTab === "overview" && (
        <section
          id="overview"
          className="mlb-team-overview"
        >
          <MLBTeamStanding
            standings={standings}
            teamId={teamId}
          />
        </section>
      )}

      {activeTab === "schedule" && (
        <section
          id="schedule"
          className="mlb-team-schedule"
        >
          <MLBTeamSchedule
            games={schedule}
            teamId={teamId}
          />
        </section>
      )}

      {activeTab === "roster" && (
        <section id="roster">
          <MLBRoster players={roster} />
        </section>
      )}

      {activeTab === "leaders" && (
        <section
          id="leaders"
          className="mlb-team-leaders"
        >
          <MLBTeamLeaders leaders={leaders} />
        </section>
      )}
    </main>
  );
}