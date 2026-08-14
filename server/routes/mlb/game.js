import express from "express";
import { getGameById } from "../../services/mlb/game.js";

const router = express.Router();

router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await getGameById(gameId);

    res.json(game);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load MLB game",
    });
  }
});

export default router;