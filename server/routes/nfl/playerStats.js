import express from "express";
import { getPlayerStats } from "../../services/nfl/playerStats.js";

const router = express.Router();

router.get("/:playerId/stats", async (req, res) => {
  try {
    const stats = await getPlayerStats(
      req.params.playerId,
      req.query.season
    );

    res.json(stats);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load NFL player stats",
    });
  }
});

export default router;