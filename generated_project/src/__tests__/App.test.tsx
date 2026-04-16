import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App integration flow', () => {
  test('player wins, cells are highlighted and board resets correctly', () => {
    render(<App />);

    // Identify the Reset button (it has visible text "Reset")
    const resetButton = screen.getByRole('button', { name: /reset/i });

    // All buttons on the page include the 9 cells plus the Reset button.
    // Filter out the Reset button to obtain only the cell buttons.
    const allButtons = screen.getAllByRole('button');
    const cellButtons = allButtons.filter((b) => b !== resetButton);

    // Simulate a winning sequence for the first player (X):
    // X at 0, O at 3, X at 1, O at 4, X at 2 → top row win.
    fireEvent.click(cellButtons[0]); // X
    fireEvent.click(cellButtons[3]); // O
    fireEvent.click(cellButtons[1]); // X
    fireEvent.click(cellButtons[4]); // O
    fireEvent.click(cellButtons[2]); // X wins

    // Verify the status message reflects the win.
    const statusMessage = screen.getByTestId('statusMessage');
    expect(statusMessage).toHaveTextContent(/wins/i);

    // Winning cells should have the highlight class.
    expect(cellButtons[0]).toHaveClass('highlight');
    expect(cellButtons[1]).toHaveClass('highlight');
    expect(cellButtons[2]).toHaveClass('highlight');

    // Click the Reset button.
    fireEvent.click(resetButton);

    // After reset, all cells should be empty and not highlighted.
    cellButtons.forEach((cell) => {
      expect(cell).toHaveTextContent('');
      expect(cell).not.toHaveClass('highlight');
    });

    // The status message should return to the initial state (e.g., next player).
    expect(statusMessage).toHaveTextContent(/next player/i);
  });
});