import express from "express";
import { getPlayerStats } from "../../services/mlb/playerStats.js";

const router = express.Router();

router.get("/:playerId/stats", async (req, res) => {
  try {
    const { playerId } = req.params;

    const stats = await getPlayerStats(playerId);

    res.json(stats);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load MLB player stats",
    });
  }
});

export default router;