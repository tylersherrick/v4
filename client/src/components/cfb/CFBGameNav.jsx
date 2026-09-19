import { Link, useNavigate } from "react-router-dom";

export default function CFBGameNav() {
  const navigate = useNavigate();

  return (
    <div className="game-nav">
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          navigate(-1);
        }}
      >
        ← Back
      </a>

      <Link to="/cfb">
        ← Back to Games
      </Link>
    </div>
  );
}