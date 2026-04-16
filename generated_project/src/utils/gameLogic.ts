type Board = ("" | "X" | "O")[];

enum Player {
  X = "X",
  O = "O",
}

/**
 * Checks whether a move can be placed at the given index.
 * @param board Current board state.
 * @param index Position where the player wants to move (0‑based).
 * @returns `true` if the index is within bounds and the cell is empty.
 */
export function isValidMove(board: Board, index: number): boolean {
  return index >= 0 && index < board.length && board[index] === "";
}

/**
 * Returns a new board with the player's mark placed at the given index.
 * The original board is never mutated.
 * If the move is invalid, the original board is returned unchanged.
 *
 * @param board Current board state.
 * @param index Position where the player wants to move (0‑based).
 * @param player Player making the move.
 * @returns A new board array reflecting the move.
 */
export function makeMove(board: Board, index: number, player: Player): Board {
  if (!isValidMove(board, index)) {
    // Invalid move – return a shallow copy to keep the function pure
    return board.slice();
  }
  const newBoard = board.slice();
  newBoard[index] = player;
  return newBoard;
}

/**
 * Determines if there is a winner on the board.
 *
 * @param board Current board state.
 * @returns The winning `Player` if one exists, otherwise `null`.
 */
export function checkWinner(board: Board): Player | null {
  const lines: number[][] = [
    // rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const first = board[a];
    if (first !== "" && first === board[b] && first === board[c]) {
      // `first` is either "X" or "O", which matches the Player enum values
      return first as Player;
    }
  }
  return null;
}

/**
 * Checks whether the game ended in a draw.
 * A draw occurs when all cells are filled and there is no winner.
 *
 * @param board Current board state.
 * @returns `true` if the game is a draw, otherwise `false`.
 */
export function isDraw(board: Board): boolean {
  return board.every(cell => cell !== "") && checkWinner(board) === null;
}

/**
 * Returns an array of all empty cell indices.
 *
 * @param board Current board state.
 * @returns List of indices where a move can be made.
 */
export function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, idx) => {
    if (cell === "") acc.push(idx);
    return acc;
  }, []);
}

/**
 * Resets the board to its initial empty state.
 *
 * @returns A new board array with nine empty cells.
 */
export function resetBoard(): Board {
  // Using `Array.from` ensures a fresh array instance each call.
  return Array.from({ length: 9 }, () => "");
}

/**
 * Minimax algorithm implementation for Tic‑Tac‑Toe.
 *
 * @param board Current board state.
 * @param depth Current recursion depth (used for scoring).
 * @param isMaximizing `true` if the current layer should maximise the score (AI's turn).
 * @param aiPlayer The player the AI is playing as.
 * @returns Numerical score for the board position.
 */
export function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player
): number {
  const winner = checkWinner(board);
  const opponent: Player = aiPlayer === Player.X ? Player.O : Player.X;

  // Terminal states
  if (winner === aiPlayer) return 10 - depth;
  if (winner === opponent) return depth - 10;
  if (isDraw(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of getAvailableMoves(board)) {
      const newBoard = makeMove(board, move, aiPlayer);
      const score = minimax(newBoard, depth + 1, false, aiPlayer);
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of getAvailableMoves(board)) {
      const newBoard = makeMove(board, move, opponent);
      const score = minimax(newBoard, depth + 1, true, aiPlayer);
      bestScore = Math.min(bestScore, score);
    }
    return bestScore;
  }
}

/**
 * Determines the best move for the AI using the minimax algorithm.
 *
 * @param board Current board state.
 * @param aiPlayer The player the AI is playing as.
 * @returns Index of the optimal move, or `-1` if no moves are available.
 */
export function getBestMove(board: Board, aiPlayer: Player): number {
  const opponent: Player = aiPlayer === Player.X ? Player.O : Player.X;
  let bestScore = -Infinity;
  let bestMove = -1;

  for (const move of getAvailableMoves(board)) {
    const newBoard = makeMove(board, move, aiPlayer);
    const score = minimax(newBoard, 0, false, aiPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// Export types for external use
export type { Board };
export { Player };