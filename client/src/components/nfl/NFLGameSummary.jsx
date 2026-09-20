export default function NFLGameSummary({
  game,
  isPregame,
}) {
  const awayQuarterScores =
    game.awayTeam.quarterScores || [];

  const homeQuarterScores =
    game.homeTeam.quarterScores || [];

  const quarterCount = Math.max(
    awayQuarterScores.length,
    homeQuarterScores.length
  );

  return (
    <div>
      <h2>Scoring</h2>

      {!isPregame && quarterCount > 0 && (
        <div className="cfb-linescore">
          <table>
            <thead>
              <tr>
                <th>Team</th>

                {Array.from(
                  { length: quarterCount },
                  (_, index) => (
                    <th key={index}>
                      {index < 4
                        ? index + 1
                        : `OT${index - 3}`}
                    </th>
                  )
                )}

                <th>T</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{game.awayTeam.name}</td>

                {Array.from(
                  { length: quarterCount },
                  (_, index) => (
                    <td key={index}>
                      {awayQuarterScores[index]?.score ??
                        "-"}
                    </td>
                  )
                )}

                <td>{game.awayTeam.score}</td>
              </tr>

              <tr>
                <td>{game.homeTeam.name}</td>

                {Array.from(
                  { length: quarterCount },
                  (_, index) => (
                    <td key={index}>
                      {homeQuarterScores[index]?.score ??
                        "-"}
                    </td>
                  )
                )}

                <td>{game.homeTeam.score}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}