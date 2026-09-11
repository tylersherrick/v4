import MLB from "../homegames/mlb.jsx";
import CFB from "../homegames/cfb.jsx";
import NFL from "../homegames/nfl.jsx";
import SportsNav from "./SportsNav.jsx";

export default function HomePage() {
  return (
    <main>
      <SportsNav />

      <h1>Game Center</h1>

      <MLB />
      <CFB />
      <NFL />
    </main>
  );
}