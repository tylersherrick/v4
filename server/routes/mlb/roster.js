import express from "express";
import { getTeamRoster } from "../../services/mlb/roster.js";

const router = express.Router();

router.get("/:teamId/roster", async (req, res) => {
  try {
    const { teamId } = req.params;

    const roster = await getTeamRoster(teamId);

    res.json(roster);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load MLB team roster",
    });
  }
});

export default router;