
import {
  Link,
  useNavigate,
} from "react-router-dom";

export default function NFLGameNav({
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
          href={`https://sports-prediction-engine.onrender.com/nfl/${encodeURIComponent(gameId)}/report`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Game Prediction
        </a>
      )}

      <Link to="/nfl">← Back to Games</Link>
    </div>
  );
}