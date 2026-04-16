import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from '../components/Game';

describe('Game integration tests', () => {
  /**
   * Helper to retrieve a cell by its row/col coordinates.
   * The Board component in this project assigns a `data-testid` in the form
   * `cell-<row>-<col>` to each cell.
   */
  const getCell = (row: number, col: number) =>
    screen.getByTestId(`cell-${row}-${col}`);

  test('mode switching to AI enables AI moves', async () => {
    render(<Game />);

    // Switch the mode – the selector is labelled “Mode”
    const modeSelect = screen.getByLabelText(/mode/i);
    fireEvent.change(modeSelect, { target: { value: 'ai' } });

    // Player makes the first move
    const firstCell = getCell(0, 0);
    fireEvent.click(firstCell);
    expect(firstCell).toHaveTextContent('X');

    // AI should automatically place its mark (O) in a different cell.
    await waitFor(() => {
      const allCells = screen.getAllByTestId(/^cell-/);
      const occupied = allCells.filter(
        (c) => c.textContent && c.textContent !== ''
      );
      // After the AI response there must be at least two occupied cells.
      expect(occupied.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('detects a win for X in Player‑vs‑Player mode', () => {
    render(<Game />);

    // Simulate X completing the top row: (0,0) → (0,1) → (0,2)
    fireEvent.click(getCell(0, 0)); // X
    fireEvent.click(getCell(1, 0)); // O (auto‑filled by the hook)
    fireEvent.click(getCell(0, 1)); // X
    fireEvent.click(getCell(1, 1)); // O
    fireEvent.click(getCell(0, 2)); // X – this should be the winning move

    // The game displays a winner announcement, e.g. “Winner: X”.
    expect(screen.getByText(/winner:\s*x/i)).toBeInTheDocument();
  });

  test('AI can win and the win is detected', async () => {
    render(<Game />);

    // Switch to AI mode
    const modeSelect = screen.getByLabelText(/mode/i);
    fireEvent.change(modeSelect, { target: { value: 'ai' } });

    // Player (X) makes a move that allows the AI to win on its next turn.
    // A simple forced‑win scenario: X takes the centre, AI takes a corner,
    // X takes the opposite corner – AI can then complete a diagonal.
    fireEvent.click(getCell(1, 1)); // X centre
    await waitFor(() => {
      // wait for AI's first move
      const aiCell = screen.getAllByTestId(/^cell-/).find(
        (c) => c.textContent === 'O'
      );
      expect(aiCell).toBeInTheDocument();
    });

    fireEvent.click(getCell(0, 2)); // X opposite corner

    // Wait for AI to make its winning move and for the win message to appear.
    await waitFor(() => {
      expect(screen.getByText(/winner:\s*o/i)).toBeInTheDocument();
    });
  });
});