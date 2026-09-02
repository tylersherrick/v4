import express from "express";
import { getTodayGames } from "../../services/mlb/games.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const games = await getTodayGames(req.query.date);
    const limit = Number(req.query.limit);

    if (limit > 0) {
      const statusOrder = {
        in: 0,
        pre: 1,
        post: 2,
      };

      const limitedGames = [...games]
        .sort(
          (a, b) =>
            (statusOrder[a.status?.state] ?? 1) -
            (statusOrder[b.status?.state] ?? 1)
        )
        .slice(0, limit);

      return res.json(limitedGames);
    }

    res.json(games);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load MLB games",
    });
  }
});

export default router;