import { Routes, Route } from "react-router-dom";
import HomePage from "./components/home/HomePage.jsx";
import MLBGames from "./components/mlb/MLBGames.jsx";
import MLBGamePage from "./components/mlb/MLBGamePage.jsx";
import MLBTeamPage from "./components/mlb/MLBTeamPage.jsx";
import MLBPlayerPage from "./components/mlb/MLBPlayerPage.jsx";
import MLBFullSchedule from "./components/mlb/MLBFullSchedule.jsx";
import CFBGames from "./components/cfb/CFBGames.jsx";
import CFBGamePage from "./components/cfb/CFBGamePage.jsx";
import CFBPlayerPage from "./components/cfb/CFBPlayerPage.jsx";
import NFLGames from "./components/nfl/NFLGames.jsx";
import NFLGamePage from "./components/nfl/NFLGamePage.jsx";
import NFLPlayerPage from "./components/nfl/NFLPlayerPage.jsx";
import NFLPredictionPage from "./components/nfl/NFLPredictionPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/mlb" element={<MLBGames />} />
      <Route path="/mlb/game/:gameId" element={<MLBGamePage />} />
      <Route path="/mlb/team/:teamId" element={<MLBTeamPage />} />
      <Route path="/mlb/team/:teamId/schedule" element={<MLBFullSchedule />} />
      <Route path="/mlb/player/:playerId" element={<MLBPlayerPage />} />

      <Route path="/cfb" element={<CFBGames />} />
      <Route path="/cfb/game/:gameId" element={<CFBGamePage />} />
      <Route path="/cfb/player/:playerId" element={<CFBPlayerPage />} />

      <Route path="/nfl" element={<NFLGames />} />
      <Route path="/nfl/game/:gameId" element={<NFLGamePage />} />
      <Route path="/nfl/player/:playerId" element={<NFLPlayerPage />} />
      <Route path="/prediction/:gameId" element={<NFLPredictionPage />} />
    </Routes>
  );
}