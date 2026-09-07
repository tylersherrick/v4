import express from "express";
import { searchPlayers } from "../../services/cfb/playerSearch.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const players = await searchPlayers(req.query.q);

    res.json(players);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to search CFB players",
    });
  }
});

export default router;