export default function MLBCareerTotals({ title, stats }) {
  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }

  const isBatting = title.toLowerCase().includes("batting");
  const isPitching = title.toLowerCase().includes("pitching");

  let primaryLabels = [];

  if (isBatting) {
    primaryLabels = ["AVG", "OBP", "SLG", "OPS"];
  }

  if (isPitching) {
    primaryLabels = ["ERA", "WHIP", "SO"];
  }

  const primaryStats = primaryLabels
    .filter((label) => stats[label] != null)
    .map((label) => [label, stats[label]]);

  const secondaryStats = Object.entries(stats).filter(
    ([label]) => !primaryLabels.includes(label)
  );

  return (
    <section className="mlb-player-career-card">
      <h2>{title}</h2>

      {primaryStats.length > 0 && (
        <div className="mlb-player-primary-stats">
          {primaryStats.map(([label, value]) => (
            <div
              key={label}
              className="mlb-player-primary-stat"
            >
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}

      {secondaryStats.length > 0 && (
        <div className="mlb-player-secondary-stats">
          {secondaryStats.map(([label, value]) => (
            <div
              key={label}
              className="mlb-player-secondary-stat"
            >
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}