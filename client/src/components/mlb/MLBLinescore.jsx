export default function MLBLinescore({ awayTeam, homeTeam }) {
  const innings = Math.max(
    9,
    awayTeam.linescores.innings.length,
    homeTeam.linescores.innings.length
  );

  function getRuns(team, index) {
    return team.linescores.innings?.[index]?.runs ?? "-";
  }

  if (innings === 0) {
    return null;
  }

  return (
    <div className="mlb-linescore">
      <div className="mlb-linescore-row mlb-linescore-header">
        <span>TEAM</span>

        {Array.from({ length: innings }, (_, index) => (
          <span key={`header-${index}`}>
            {index + 1}
          </span>
        ))}

        <span className="mlb-linescore-total">R</span>
        <span className="mlb-linescore-total">H</span>
        <span className="mlb-linescore-total">E</span>
      </div>

      <div className="mlb-linescore-row">
        <span className="mlb-linescore-team">
          {awayTeam.abbreviation}
        </span>

        {Array.from({ length: innings }, (_, index) => (
          <span key={`away-${index}`}>
            {getRuns(awayTeam, index)}
          </span>
        ))}

        <strong className="mlb-linescore-total">
          {awayTeam.score}
        </strong>

        <strong className="mlb-linescore-total">
          {awayTeam.linescores.hits}
        </strong>

        <strong className="mlb-linescore-total">
          {awayTeam.linescores.errors}
        </strong>
      </div>

      <div className="mlb-linescore-row">
        <span className="mlb-linescore-team">
          {homeTeam.abbreviation}
        </span>

        {Array.from({ length: innings }, (_, index) => (
          <span key={`home-${index}`}>
            {getRuns(homeTeam, index)}
          </span>
        ))}

        <strong className="mlb-linescore-total">
          {homeTeam.score}
        </strong>

        <strong className="mlb-linescore-total">
          {homeTeam.linescores.hits}
        </strong>

        <strong className="mlb-linescore-total">
          {homeTeam.linescores.errors}
        </strong>
      </div>
    </div>
  );
}