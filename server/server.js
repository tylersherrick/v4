import express from "express";
import cors from "cors";
import mlbGamesRouter from "./routes/mlb/games.js";
import mlbGameRouter from "./routes/mlb/game.js";
import mlbTeamScheduleRouter from "./routes/mlb/teamSchedule.js";
import mlbTeamRouter from "./routes/mlb/team.js";
import mlbRosterRouter from "./routes/mlb/roster.js";
import mlbPlayerRouter from "./routes/mlb/player.js";
import mlbPlayerStatsRouter from "./routes/mlb/playerStats.js";
import mlbPlayerSearchRouter from "./routes/mlb/playerSearch.js";
import mlbStandingsRouter from "./routes/mlb/standings.js";
import mlbTeamLeadersRouter from "./routes/mlb/teamLeaders.js";

import cfbGamesRouter from "./routes/cfb/games.js";
import cfbGameRouter from "./routes/cfb/game.js";
import cfbTeamRouter from "./routes/cfb/team.js";
import cfbTeamScheduleRouter from "./routes/cfb/teamSchedule.js";
import cfbRosterRouter from "./routes/cfb/roster.js";
import cfbPlayerRouter from "./routes/cfb/player.js";
import cfbPlayerStatsRouter from "./routes/cfb/playerStats.js";
import cfbPlayerSearchRouter from "./routes/cfb/playerSearch.js";
import cfbRankingsRouter from "./routes/cfb/rankings.js";
import cfbCoachRouter from "./routes/cfb/coach.js";
import cfbTeamLeadersRouter from "./routes/cfb/teamLeaders.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({
    message: "V4 Sports API",
  });
});

app.use("/api/mlb/games", mlbGamesRouter);
app.use("/api/mlb/game", mlbGameRouter);
app.use("/api/mlb/teams", mlbTeamScheduleRouter);
app.use("/api/mlb/team", mlbTeamRouter);
app.use("/api/mlb/team", mlbRosterRouter);
app.use("/api/mlb/player", mlbPlayerRouter);
app.use("/api/mlb/player", mlbPlayerStatsRouter);
app.use("/api/mlb/players", mlbPlayerSearchRouter);
app.use("/api/mlb/standings", mlbStandingsRouter);
app.use("/api/mlb/team", mlbTeamLeadersRouter);

app.use("/api/cfb/games", cfbGamesRouter);
app.use("/api/cfb/game", cfbGameRouter);
app.use("/api/cfb/team", cfbTeamRouter);
app.use("/api/cfb/team", cfbTeamScheduleRouter);
app.use("/api/cfb/team", cfbRosterRouter);
app.use("/api/cfb/player", cfbPlayerRouter);
app.use("/api/cfb/player", cfbPlayerStatsRouter);
app.use("/api/cfb/players", cfbPlayerSearchRouter);
app.use("/api/cfb/rankings", cfbRankingsRouter);
app.use("/api/cfb/coach", cfbCoachRouter);
app.use("/api/cfb/team-leaders", cfbTeamLeadersRouter);



app.listen(PORT, () => {
  console.log(`V4 API running on port ${PORT}`);
});