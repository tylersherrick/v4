import express from "express";
import { getTodayGames } from "../../services/nhl/games.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const games = await getTodayGames(req.query.date);
    const limit = Number(req.query.limit);

    if (limit > 0) {
      return res.json(games.slice(0, limit));
    }

    res.json(games);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load NHL games",
    });
  }
});

export default router;