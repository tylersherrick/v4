import express from "express";
import { getTeamSchedule } from "../../services/nfl/teamSchedule.js";

const router = express.Router();

router.get("/:teamId/schedule", async (req, res) => {
  try {
    const schedule = await getTeamSchedule(
      req.params.teamId,
      req.query.season
    );

    res.json(schedule);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load NFL team schedule",
    });
  }
});

export default router;