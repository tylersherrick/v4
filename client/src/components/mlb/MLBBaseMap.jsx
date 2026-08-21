export default function MLBBaseMap({ bases }) {
  return (
    <div className="mlb-base-map">
      <div className={`mlb-base mlb-base-second ${bases?.second ? "occupied" : ""}`} />
      <div className={`mlb-base mlb-base-third ${bases?.third ? "occupied" : ""}`} />
      <div className={`mlb-base mlb-base-first ${bases?.first ? "occupied" : ""}`} />
    </div>
  );
}