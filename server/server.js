import express from "express";
import cors from "cors";
import mlbGamesRouter from "./routes/mlb/games.js";
import mlbGameRouter from "./routes/mlb/game.js";
import mlbTeamsRouter from "./routes/mlb/teamSchedule.js";

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
app.use("/api/mlb/teams", mlbTeamsRouter);

app.listen(PORT, () => {
  console.log(`V4 API running on port ${PORT}`);
});