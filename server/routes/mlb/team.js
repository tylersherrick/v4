import express from "express";
import { getTeamById } from "../../services/mlb/team.js";

const router = express.Router();

router.get("/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await getTeamById(teamId);

    res.json(team);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load MLB team",
    });
  }
});

export default router;