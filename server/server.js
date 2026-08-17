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

app.listen(PORT, () => {
  console.log(`V4 API running on port ${PORT}`);
});