import { type } from "os";

/**
 * Player enumeration for Tic‑Tac‑Toe.
 * Using string values keeps compatibility with any UI that expects "X" or "O".
 */
export enum Player {
  X = "X",
  O = "O",
}

/**
 * Board representation – an array of nine cells.
 * Each cell can contain a Player value or be empty (`null`).
 */
export type Board = (Player | null)[];

/**
 * All possible winning line combinations for a 3×3 board.
 */
const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Helper: determine the winner of the current board.
 *
 * @param board Current board state.
 * @returns `Player.X`, `Player.O` or `null` if there is no winner yet.
 */
function checkWinner(board: Board): Player | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v1 = board[a];
    const v2 = board[b];
    const v3 = board[c];
    if (v1 && v1 === v2 && v2 === v3) {
      return v1;
    }
  }
  return null;
}

/**
 * Helper: are there any empty cells left?
 */
function isMovesLeft(board: Board): boolean {
  return board.some((cell) => cell === null);
}

/**
 * Core minimax recursion.
 *
 * The function works with two closure‑scoped variables – `aiPlayer` and `opponent` –
 * that are set by `getBestMove` before the first call.
 *
 * @param board   Current board (mutated during recursion, restored before return).
 * @param depth   Current depth in the game tree.
 * @param isMax   `true` if the current layer is the AI's turn, `false` otherwise.
 * @returns The best score achievable from this position.
 */
export function minimax(board: Board, depth: number, isMax: boolean): number {
  const winner = checkWinner(board);
  if (winner === aiPlayer) {
    // AI wins – prefer quicker wins (subtract depth)
    return 10 - depth;
  }
  if (winner === opponent) {
    // Opponent wins – prefer slower losses (add depth)
    return -10 + depth;
  }

  // Draw condition
  if (!isMovesLeft(board)) {
    return 0;
  }

  if (isMax) {
    // AI's turn – maximize score
    let best = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        const val = minimax(board, depth + 1, false);
        best = Math.max(best, val);
        board[i] = null; // undo move
      }
    }
    return best;
  } else {
    // Opponent's turn – minimize score
    let best = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = opponent;
        const val = minimax(board, depth + 1, true);
        best = Math.min(best, val);
        board[i] = null; // undo move
      }
    }
    return best;
  }
}

/**
 * Closure‑scoped variables used by `minimax`. They are set each time
 * `getBestMove` is invoked.
 */
let aiPlayer: Player;
let opponent: Player;

/**
 * Determines the optimal move for the supplied AI player using the minimax algorithm.
 *
 * @param board Current board state.
 * @param player The AI player (`Player.X` or `Player.O`).
 * @returns Index (0‑8) of the best move. Returns -1 if no moves are possible.
 */
export function getBestMove(board: Board, player: Player): number {
  // Initialise closure variables for this search
  aiPlayer = player;
  opponent = player === Player.X ? Player.O : Player.X;

  let bestVal = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      // Simulate AI move
      board[i] = aiPlayer;
      const moveVal = minimax(board, 0, false); // next turn is opponent's
      board[i] = null; // undo

      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }

  return bestMove;
}