
import {
  Link,
  useNavigate,
} from "react-router-dom";

export default function NHLGameNav({
  gameId,
  isPregame,
}) {
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

      {isPregame && (
        <Link to={`/nhl/prediction/${gameId}`}>
          Game Prediction
        </Link>
      )}

      <Link to="/nhl">← Back to Games</Link>
    </div>
  );
}
