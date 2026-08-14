import express from "express";
import { getTeamSchedule } from "../../services/mlb/teamSchedule.js";

const router = express.Router();

router.get("/:teamId/schedule", async (req, res) => {
  try {
    const { teamId } = req.params;

    const schedule = await getTeamSchedule(teamId);

    res.json(schedule);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load MLB team schedule",
    });
  }
});

export default router;