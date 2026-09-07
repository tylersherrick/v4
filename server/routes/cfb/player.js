import express from "express";
import { getPlayer } from "../../services/cfb/player.js";

const router = express.Router();

router.get("/:playerId", async (req, res) => {
  try {
    const player = await getPlayer(req.params.playerId);

    res.json(player);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load CFB player",
    });
  }
});

export default router;