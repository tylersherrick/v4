import { Link } from "react-router-dom";
import MLB from "../homegames/mlb.jsx";
import CFB from "../homegames/cfb.jsx";

export default function HomePage() {
  return (
    <main>
      <nav className="sports-nav">
        <Link to="/mlb">MLB</Link>
        <Link to="/cfb">CFB</Link>
        <span>NFL</span>
        <span>NBA</span>
        <span>NHL</span>
      </nav>

      <h1>Game Center</h1>

      <MLB />
      <CFB />
    </main>
  );
}