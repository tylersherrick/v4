import express from "express";
import { getTeam } from "../../services/nfl/team.js";

const router = express.Router();

router.get("/:teamId", async (req, res) => {
  try {
    const team = await getTeam(req.params.teamId);

    res.json(team);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load NFL team",
    });
  }
});

export default router;