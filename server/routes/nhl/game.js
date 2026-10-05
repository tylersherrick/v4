import express from "express";
import { getGame } from "../../services/nhl/game.js";

const router = express.Router();

router.get("/:gameId", async (req, res) => {
  try {
    const game = await getGame(req.params.gameId);

    res.json(game);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load NHL game",
    });
  }
});

export default router;