import { useState } from "react";
import MLB from "../homegames/mlb.jsx";
import CFB from "../homegames/cfb.jsx";
import NFL from "../homegames/nfl.jsx";
import NHL from "../homegames/nhl.jsx";
import SportsNav from "./SportsNav.jsx";

export default function HomePage() {
  const [activeLeague, setActiveLeague] = useState("mlb");

  function renderLeague() {
    switch (activeLeague) {
      case "mlb":
        return <MLB />;
      case "cfb":
        return <CFB />;
      case "nhl":
        return <NHL />;
      case "nfl":
      default:
        return <NFL />;
    }
  }

  return (
    <main>
      <SportsNav
        activeLeague={activeLeague}
        onLeagueChange={setActiveLeague}
      />

      <h1>Game Center</h1>

      {renderLeague()}
    </main>
  );
}