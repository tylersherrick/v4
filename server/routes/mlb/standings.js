import express from "express";
import { getMLBStandings } from "../../services/mlb/standings.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const standings = await getMLBStandings();
    res.json(standings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load MLB standings",
    });
  }
});

export default router;