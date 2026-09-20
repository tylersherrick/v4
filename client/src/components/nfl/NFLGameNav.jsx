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
        <Link to={`/prediction/${gameId}`}>
          Game Prediction
        </Link>
      )}

      <Link to="/nfl">← Back to Games</Link>
    </div>
  );
}