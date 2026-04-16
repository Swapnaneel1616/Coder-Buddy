import { getAIMove, Difficulty } from '../utils/ai';

describe('AI move selection', () => {
  test('Easy difficulty returns a valid empty cell index', () => {
    const board = ['X', 'O', '', '', '', '', '', '', ''];
    const emptyIndices = board
      .map((cell, idx) => (cell === '' ? idx : -1))
      .filter(idx => idx !== -1);

    const move = getAIMove(board, 'X', Difficulty.Easy);

    // The move should be one of the empty positions
    expect(emptyIndices).toContain(move);
    // And the chosen cell must indeed be empty
    expect(board[move]).toBe('');
  });

  test('Hard difficulty picks a winning move when available', () => {
    // AI is 'O' and can win by placing at index 2
    const board = ['O', 'O', '', 'X', 'X', '', '', '', ''];
    const move = getAIMove(board, 'O', Difficulty.Hard);
    expect(move).toBe(2);
  });

  test('Hard difficulty blocks opponent winning move when no immediate win', () => {
    // Opponent 'X' can win at index 2, AI is 'O' and should block
    const board = ['X', 'X', '', 'O', '', '', '', '', ''];
    const move = getAIMove(board, 'O', Difficulty.Hard);
    expect(move).toBe(2);
  });

  test('Hard difficulty chooses a move when board is not full and no immediate win/block', () => {
    const board = ['X', '', 'O', '', 'X', '', '', 'O', ''];
    const move = getAIMove(board, 'O', Difficulty.Hard);
    // The move must be an empty cell
    expect(board[move]).toBe('');
  });
});