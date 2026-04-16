import {
  makeMove,
  isValidMove,
  calculateWinner,
  isDraw,
  getAIMove,
} from '../gameLogic';

describe('Game Logic', () => {
  const emptyBoard = Array(9).fill(null) as (string | null)[];

  test('isValidMove should reject out‑of‑range indices', () => {
    expect(isValidMove(emptyBoard, -1)).toBe(false);
    expect(isValidMove(emptyBoard, 9)).toBe(false);
  });

  test('isValidMove should reject occupied cells', () => {
    const board = [...emptyBoard];
    board[4] = 'X';
    expect(isValidMove(board, 4)).toBe(false);
  });

  test('isValidMove should accept a free cell within range', () => {
    expect(isValidMove(emptyBoard, 3)).toBe(true);
  });

  test('makeMove should place a mark and keep immutability', () => {
    const board = [...emptyBoard];
    const newBoard = makeMove(board, 0, 'X');

    // original board unchanged
    expect(board[0]).toBeNull();

    // new board reflects the move
    expect(newBoard[0]).toBe('X');

    // a new array instance is returned
    expect(newBoard).not.toBe(board);
  });

  test('calculateWinner detects a row win', () => {
    const board = [...emptyBoard];
    board[0] = 'X';
    board[1] = 'X';
    board[2] = 'X';
    expect(calculateWinner(board)).toBe('X');
  });

  test('calculateWinner detects a column win', () => {
    const board = [...emptyBoard];
    board[0] = 'O';
    board[3] = 'O';
    board[6] = 'O';
    expect(calculateWinner(board)).toBe('O');
  });

  test('calculateWinner detects a diagonal win (top‑left to bottom‑right)', () => {
    const board = [...emptyBoard];
    board[0] = 'X';
    board[4] = 'X';
    board[8] = 'X';
    expect(calculateWinner(board)).toBe('X');
  });

  test('calculateWinner detects a diagonal win (top‑right to bottom‑left)', () => {
    const board = [...emptyBoard];
    board[2] = 'O';
    board[4] = 'O';
    board[6] = 'O';
    expect(calculateWinner(board)).toBe('O');
  });

  test('calculateWinner returns null when there is no winner', () => {
    const board = [...emptyBoard];
    board[0] = 'X';
    board[1] = 'O';
    board[2] = 'X';
    expect(calculateWinner(board)).toBeNull();
  });

  test('isDraw returns true for a full board with no winner', () => {
    const board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ] as (string | null)[];
    expect(calculateWinner(board)).toBeNull();
    expect(isDraw(board)).toBe(true);
  });

  test('isDraw returns false for a non‑full board', () => {
    const board = [...emptyBoard];
    board[0] = 'X';
    expect(isDraw(board)).toBe(false);
  });

  test('isDraw returns false when there is a winner', () => {
    const board = [...emptyBoard];
    board[0] = 'X';
    board[1] = 'X';
    board[2] = 'X';
    // board is not full but even if it were, winner takes precedence
    expect(isDraw(board)).toBe(false);
  });

  // ---------- AI Move Selection Tests ----------
  test('AI selects a winning move when available', () => {
    // AI plays as 'O' and can win on the top row
    const board = [
      'O', 'O', null,
      'X', 'X', null,
      null, null, null,
    ] as (string | null)[];
    const move = getAIMove(board, 'O');
    expect(move).toBe(2);
    // Verify the move results in a win
    const newBoard = makeMove(board, move, 'O');
    expect(calculateWinner(newBoard)).toBe('O');
  });

  test('AI blocks opponent\'s winning move', () => {
    // Human is 'X' and is about to win on the top row
    const board = [
      'X', 'X', null,
      null, 'O', null,
      null, null, null,
    ] as (string | null)[];
    const move = getAIMove(board, 'O');
    expect(move).toBe(2);
    // After AI move, opponent should no longer have a winning line
    const newBoard = makeMove(board, move, 'O');
    expect(calculateWinner(newBoard)).toBeNull();
  });

  test('AI chooses the center on an empty board', () => {
    const board = [...emptyBoard];
    const move = getAIMove(board, 'O');
    expect(move).toBe(4);
    const newBoard = makeMove(board, move, 'O');
    expect(newBoard[4]).toBe('O');
  });

  test('AI always returns a valid, empty index', () => {
    const board = [
      'X', null, 'O',
      null, 'X', null,
      null, null, 'O',
    ] as (string | null)[];
    const move = getAIMove(board, 'O');
    expect(isValidMove(board, move)).toBe(true);
    const newBoard = makeMove(board, move, 'O');
    expect(newBoard[move]).toBe('O');
  });
});