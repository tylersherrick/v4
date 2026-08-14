import express from "express";
import { getTodayGames } from "../../services/mlb/games.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const games = await getTodayGames();

    res.json(games);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load MLB games",
    });
  }
});

export default router;