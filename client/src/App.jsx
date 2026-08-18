import { Routes, Route } from "react-router-dom";
import MLBGames from "./components/mlb/MLBGames.jsx";
import MLBGamePage from "./components/mlb/MLBGamePage.jsx";
import MLBTeamPage from "./components/mlb/MLBTeamPage.jsx";
import MLBPlayerPage from "./components/mlb/MLBPlayerPage.jsx";
import MLBFullSchedule from "./components/mlb/MLBFullSchedule.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MLBGames />} />
      <Route path="/mlb/game/:gameId" element={<MLBGamePage />} />
      <Route path="/mlb/team/:teamId" element={<MLBTeamPage />} />
      <Route path="/mlb/team/:teamId/schedule" element={<MLBFullSchedule />} />
      <Route path="/mlb/player/:playerId" element={<MLBPlayerPage />} />
    </Routes>
  );
}