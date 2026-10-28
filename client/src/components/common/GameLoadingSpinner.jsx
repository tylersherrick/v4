
import "../../styles/loading.css";

export default function GameLoadingSpinner({
  awayTeam,
  homeTeam,
}) {
  return (
    <div className="loading-container" role="status">
      <div
        className="loading-spinner"
        aria-hidden="true"
      />

      <h2 className="game-loading-title">
        Loading Game
      </h2>

      {awayTeam && homeTeam && (
        <div className="game-loading-matchup">
          <div className="game-loading-team">
            {awayTeam.logo && (
              <img
                src={awayTeam.logo}
                alt={awayTeam.abbreviation}
              />
            )}

            <span>{awayTeam.abbreviation}</span>
          </div>

          <span className="game-loading-at">@</span>

          <div className="game-loading-team">
            {homeTeam.logo && (
              <img
                src={homeTeam.logo}
                alt={homeTeam.abbreviation}
              />
            )}

            <span>{homeTeam.abbreviation}</span>
          </div>
        </div>
      )}
    </div>
  );
}
