export default function MLBCareerTotals({ title, stats }) {
  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }

  return (
    <section>
      <h2>{title}</h2>
      <div>
        {Object.entries(stats).map(([label, value]) => (
          <span key={label}>
            {label}: {value}{" "}
          </span>
        ))}
      </div>
    </section>
  );
}