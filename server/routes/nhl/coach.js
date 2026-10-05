import express from "express";
import { getCoach } from "../../services/nhl/coach.js";

const router = express.Router();

router.get("/:coachId", async (req, res) => {
  try {
    const coach = await getCoach(req.params.coachId);

    res.json(coach);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load NHL coach",
    });
  }
});

export default router;