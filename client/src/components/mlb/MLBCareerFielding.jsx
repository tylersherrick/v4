export default function MLBCareerFielding({ positions }) {
  if (!positions?.length) {
    return null;
  }

  return (
    <section className="mlb-player-career-card">
      <h2>Career Fielding by Position</h2>

      {positions.map((position, index) => (
        <div
          key={`${position.position}-${index}`}
          className="mlb-player-fielding-position"
        >
          <h3>{position.position}</h3>

          <div className="mlb-player-secondary-stats">
            {Object.entries(position.stats || {}).map(
              ([label, value]) => (
                <div
                  key={label}
                  className="mlb-player-secondary-stat"
                >
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </section>
  );
}