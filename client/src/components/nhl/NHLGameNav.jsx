import {
  Link,
  useNavigate,
} from "react-router-dom";

export default function NHLGameNav() {
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

      <Link to="/nhl">← Back to Games</Link>
    </div>
  );
}