import express from "express";
import { getTeamLeaders } from "../../services/nfl/teamLeaders.js";

const router = express.Router();

router.get("/:teamId", async (req, res) => {
  try {
    const leaders = await getTeamLeaders(req.params.teamId);

    res.json(leaders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load NFL team leaders",
    });
  }
});

export default router;