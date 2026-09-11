import { Link, NavLink } from "react-router-dom";

export default function SportsNav({ showBack = false }) {
  return (
    <nav className="sports-nav">
      <NavLink
        to="/mlb"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        MLB
      </NavLink>

      <NavLink
        to="/cfb"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        CFB
      </NavLink>

      <NavLink
        to="/nfl"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        NFL
      </NavLink>

      <span>NBA</span>
      <span>NHL</span>

      {showBack && (
        <Link
          className="sports-nav-back"
          to="/"
        >
          ← Back to Game Center
        </Link>
      )}
    </nav>
  );
}