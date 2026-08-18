export default function MLBPlayerStats({ title, seasons }) {
  if (!seasons?.length) {
    return (
      <section className="mlb-player-stats-card">
        <h2>{title}</h2>
        <p>No stats available.</p>
      </section>
    );
  }

  const isBatting = title.toLowerCase().includes("batting");
  const isPitching = title.toLowerCase().includes("pitching");
  const isFielding = title.toLowerCase().includes("fielding");

  function getStats(season) {
    const stats = season.stats || {};

    if (isBatting) {
      return {
        primary: [
          ["AVG", stats.AVG],
          ["OBP", stats.OBP],
          ["SLG", stats.SLG],
          ["OPS", stats.OPS],
        ],
        secondary: [
          ["G", stats.G],
          ["AB", stats.AB],
          ["H", stats.H],
          ["HR", stats.HR],
          ["RBI", stats.RBI],
          ["BB", stats.BB],
          ["SO", stats.SO],
          ["SB", stats.SB],
        ],
      };
    }

    if (isPitching) {
      return {
        primary: [
          ["ERA", stats.ERA],
          ["WHIP", stats.WHIP],
          ["SO", stats.SO],
        ],
        secondary: [
          ["W", stats.W],
          ["L", stats.L],
          ["G", stats.G],
          ["GS", stats.GS],
          ["IP", stats.IP],
          ["H", stats.H],
          ["BB", stats.BB],
          ["SV", stats.SV],
        ],
      };
    }

    if (isFielding) {
      return {
        primary: [
          ["FPCT", stats.FPCT],
        ],
        secondary: [
          ["G", stats.G],
          ["GS", stats.GS],
          ["TC", stats.TC],
          ["PO", stats.PO],
          ["A", stats.A],
          ["E", stats.E],
          ["DP", stats.DP],
        ],
      };
    }

    return {
      primary: [],
      secondary: Object.entries(stats),
    };
  }

  function renderStat(label, value, primary = false) {
    if (value == null || value === "") {
      return null;
    }

    return (
      <div
        key={label}
        className={
          primary
            ? "mlb-player-primary-stat"
            : "mlb-player-secondary-stat"
        }
      >
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    );
  }

  return (
    <section className="mlb-player-stats-card">
      <h2>{title}</h2>

      {seasons.map((season, index) => {
        const { primary, secondary } = getStats(season);

        return (
          <div
            key={`${season.year}-${season.position || index}`}
            className="mlb-player-season"
          >
            <h3>
              {season.year}
              {season.position && ` - ${season.position}`}
            </h3>

            <div className="mlb-player-primary-stats">
              {primary.map(([label, value]) =>
                renderStat(label, value, true)
              )}
            </div>

            <div className="mlb-player-secondary-stats">
              {secondary.map(([label, value]) =>
                renderStat(label, value)
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}