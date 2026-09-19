import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import CFBTeamSchedule from "./CFBTeamSchedule.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

export default function CFBTeamPage() {
  const { teamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeTab = searchParams.get("tab") || "overview";

  const gamesParams = new URLSearchParams();

  if (searchParams.get("week")) {
    gamesParams.set("week", searchParams.get("week"));
  }

  if (searchParams.get("conference")) {
    gamesParams.set(
      "conference",
      searchParams.get("conference")
    );
  }

  const gamesQuery = gamesParams.toString();

  const gamesLocation =
    location.state?.gamesLocation ||
    `/cfb${gamesQuery ? `?${gamesQuery}` : ""}`;

  function setActiveTab(tab) {
    const params = new URLSearchParams(searchParams);

    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }

    setSearchParams(params, {
      state: location.state,
    });
  }

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/cfb/team/${teamId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load team");
        }

        const data = await response.json();

        setTeam(data);
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

  if (!team) {
    return <p>Team not found.</p>;
  }

  return (
    <main className="cfb-team-page">
      <div className="cfb-team-nav">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            navigate(-1);
          }}
        >
          ← Back
        </a>

        <Link to={gamesLocation}>
          ← Back to Games
        </Link>
      </div>

      <section className="cfb-team-header">
        <h1>{team.name}</h1>

        <div className="cfb-team-header-content">
          {team.logo && (
            <img
              className="cfb-team-logo"
              src={team.logo}
              alt={team.name}
            />
          )}

          <div className="cfb-team-header-info">
            {team.conference?.name && (
              <p>{team.conference.name}</p>
            )}

            {team.record && (
              <p>Record: {team.record}</p>
            )}

            {team.standingSummary && (
              <p>{team.standingSummary}</p>
            )}

            {team.headCoach?.name && (
              <p>
                Head Coach: {team.headCoach.name}
              </p>
            )}
          </div>
        </div>
      </section>

      <nav className="cfb-team-tabs">
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
        <section className="cfb-team-overview">
          {team.record && (
            <p>
              <strong>Record:</strong> {team.record}
            </p>
          )}

          {team.conference?.name && (
            <p>
              <strong>Conference:</strong>{" "}
              {team.conference.name}
            </p>
          )}

          {team.standingSummary && (
            <p>
              <strong>Standing:</strong>{" "}
              {team.standingSummary}
            </p>
          )}

          {team.headCoach?.name && (
            <p>
              <strong>Head Coach:</strong>{" "}
              {team.headCoach.name}
            </p>
          )}
        </section>
      )}

      {activeTab === "schedule" && (
        <CFBTeamSchedule teamId={teamId} />
      )}

      {activeTab === "roster" && (
        <section className="cfb-team-roster">
          <p>Roster coming next.</p>
        </section>
      )}

      {activeTab === "leaders" && (
        <section className="cfb-team-leaders">
          <p>Leaders coming next.</p>
        </section>
      )}
    </main>
  );
}