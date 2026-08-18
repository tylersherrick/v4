export default function MLBPlayerStats({ title, seasons }) {
  if (!seasons?.length) {
    return (
      <section>
        <h2>{title}</h2>
        <p>No stats available.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>{title}</h2>
      {seasons.map((season, index) => (
        <div key={`${season.year}-${season.position || index}`}>
          <h3>
            {season.year}
            {season.position && ` - ${season.position}`}
          </h3>
          {Object.entries(season.stats || {}).map(([label, value]) => (
            <span key={label}>
              {label}: {value}{" "}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}