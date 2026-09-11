import express from "express";
import { getGames } from "../../services/nfl/games.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const games = await getGames(
      req.query.season,
      req.query.week
    );

    res.json(games);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load NFL games",
    });
  }
});

export default router;