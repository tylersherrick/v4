
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
        <a
          href={`https://sports-prediction-engine.onrender.com/nhl/${encodeURIComponent(gameId)}/report`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Game Prediction
        </a>
      )}

      <Link to="/nhl">← Back to Games</Link>
    </div>
  );
}