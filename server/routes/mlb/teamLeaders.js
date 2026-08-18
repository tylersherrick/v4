import express from "express";
import { getTeamLeaders } from "../../services/mlb/teamLeaders.js";

const router = express.Router();

router.get("/:teamId/leaders", async (req, res) => {
  try {
    const leaders = await getTeamLeaders(
      req.params.teamId
    );

    res.json(leaders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load team leaders",
    });
  }
});

export default router;