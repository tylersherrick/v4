import express from "express";
import { getRoster } from "../../services/nhl/roster.js";

const router = express.Router();

router.get("/:teamId/roster", async (req, res) => {
  try {
    const roster = await getRoster(req.params.teamId);

    res.json(roster);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load NHL roster",
    });
  }
});

export default router;