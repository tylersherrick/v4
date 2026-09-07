import express from "express";
import {
  getRankings,
  getConferenceTeams,
} from "../../services/cfb/rankings.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rankings = await getRankings();
    res.json(rankings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load CFB rankings",
    });
  }
});

router.get("/conference/:conferenceId", async (req, res) => {
  try {
    const conference = await getConferenceTeams(
      req.params.conferenceId
    );

    res.json(conference);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load CFB conference",
    });
  }
});

export default router;