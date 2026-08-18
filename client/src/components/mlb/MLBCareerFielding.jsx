export default function MLBCareerFielding({ positions }) {
  if (!positions?.length) {
    return null;
  }

  return (
    <section>
      <h2>Career Fielding by Position</h2>

      {positions.map((position, index) => (
        <div key={`${position.position}-${index}`}>
          <h3>{position.position}</h3>

          {Object.entries(position.stats || {}).map(([label, value]) => (
            <span key={label}>
              {label}: {value}{" "}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}