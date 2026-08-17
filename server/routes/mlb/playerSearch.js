import express from "express";
import { searchPlayers } from "../../services/mlb/playerSearch.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        error: "Player name is required",
      });
    }

    const players = await searchPlayers(name);

    res.json({
      query: name,
      count: players.length,
      players,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to search MLB players",
    });
  }
});

export default router;