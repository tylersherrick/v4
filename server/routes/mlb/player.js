import express from "express";
import { getPlayerById } from "../../services/mlb/player.js";

const router = express.Router();

router.get("/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;

    const player = await getPlayerById(playerId);

    res.json(player);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load MLB player",
    });
  }
});

export default router;