import React from 'react';

interface ScoreBoardProps {
  /** Number of wins for player X */
  xScore: number;
  /** Number of wins for player O */
  oScore: number;
  /** Number of drawn games */
  drawScore: number;
}

/**
 * Simple scoreboard component that displays the current tally for X,
 * O and draws. It is deliberately lightweight – the parent component
 * (App) is responsible for managing the state and passing the latest
 * values as props.
 *
 * Example usage:
 *   <ScoreBoard xScore={xWins} oScore={oWins} drawScore={draws} />
 */
const ScoreBoard: React.FC<ScoreBoardProps> = ({
  xScore,
  oScore,
  drawScore,
}) => {
  return (
    <section
      style={{
        marginTop: '1rem',
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
      }}
      aria-label="score board"
    >
      <h2 style={{ margin: '0 0 0.5rem' }}>Score Board</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        <div>
          <strong>X:</strong> {xScore}
        </div>
        <div>
          <strong>O:</strong> {oScore}
        </div>
        <div>
          <strong>Draws:</strong> {drawScore}
        </div>
      </div>
    </section>
  );
};

export default ScoreBoard;