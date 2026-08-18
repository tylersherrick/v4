export default function MLBInjuries({ awayTeam, homeTeam }) {
  function renderInjuries(team) {
    if (!team.injuries?.length) {
      return <p>No injuries listed.</p>;
    }

    return team.injuries.map((player) => (
      <div key={player.id}>
        <strong>{player.name}</strong>
        {player.status && <span> - {player.status}</span>}
        {player.injury && <span> - {player.injury}</span>}
      </div>
    ));
  }

  return (
    <section>
      <h2>Injuries</h2>
      <div>
        <h3>{awayTeam.name}</h3>
        {renderInjuries(awayTeam)}
      </div>
      <div>
        <h3>{homeTeam.name}</h3>
        {renderInjuries(homeTeam)}
      </div>
    </section>
  );
}