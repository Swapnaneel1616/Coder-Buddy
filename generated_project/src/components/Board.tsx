import React, { useState, useCallback, useEffect } from "react";
import styles from "./Board.module.css";
import Cell from "./Cell";
import { calculateWinner } from "../utils/gameLogic";

interface BoardProps {
  /** Optional external board state (array of 9 strings: "X", "O" or ""). */
  board?: string[];
  /** Optional external click handler for a cell. */
  onCellClick?: (index: number) => void;
  /** Optional external winning line (array of cell indices). */
  winningLine?: number[];
  /** Enable simple AI for the "O" player (kept for backward compatibility). */
  ai?: boolean;
}

/**
 * Board component.
 *
 * - If `board` and `onCellClick` are supplied, the component works as a
 *   **pure** view: it simply renders the provided board and highlights the
 *   supplied `winningLine`.
 * - If those props are omitted, the component manages its own game state,
 *   detects wins/draws, highlights the winning line and optionally plays a
 *   very simple random‑move AI for the "O" player.
 *
 * The board is rendered using CSS‑grid and adapts its size to the viewport,
 * staying square and responsive on mobile and desktop.
 */
const Board: React.FC<BoardProps> = ({
  board: externalBoard,
  onCellClick: externalClick,
  winningLine: externalLine,
  ai = false,
}) => {
  /** ---------- Internal state (used when props are not supplied) ---------- */
  const [internalBoard, setInternalBoard] = useState<string[]>(Array(9).fill(""));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [winnerInfo, setWinnerInfo] = useState<{
    winner: string | null;
    line: number[] | null;
  }>({ winner: null, line: null });
  const [score, setScore] = useState<{ X: number; O: number; draws: number }>(
    { X: 0, O: 0, draws: 0 }
  );

  /** ---------- Responsive board size handling ---------- */
  const [boardSize, setBoardSize] = useState<number>(300); // default fallback

  const updateBoardSize = useCallback(() => {
    // Keep the board square and never larger than 90% of viewport width/height
    const max = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    // Clamp to a reasonable minimum for very small screens
    const size = Math.max(200, Math.floor(max));
    setBoardSize(size);
  }, []);

  useEffect(() => {
    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, [updateBoardSize]);

  /** Reset internal game state. */
  const resetGame = useCallback(() => {
    setInternalBoard(Array(9).fill(""));
    setXIsNext(true);
    setWinnerInfo({ winner: null, line: null });
  }, []);

  /** Internal click handler – used only when external handler is not provided. */
  const internalHandleClick = useCallback(
    (i: number) => {
      if (internalBoard[i] !== "" || winnerInfo.winner) return;

      const newBoard = internalBoard.slice();
      newBoard[i] = xIsNext ? "X" : "O";
      setInternalBoard(newBoard);

      const result = calculateWinner(newBoard);
      if (result?.winner) {
        setWinnerInfo({ winner: result.winner, line: result.line });
        setScore((prev) => ({
          ...prev,
          [result.winner as keyof typeof prev]:
            prev[result.winner as keyof typeof prev] + 1,
        }));
      } else if (newBoard.every((c) => c !== "")) {
        // draw
        setWinnerInfo({ winner: "Draw", line: null });
        setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
      } else {
        setXIsNext(!xIsNext);
      }
    },
    [internalBoard, xIsNext, winnerInfo.winner]
  );

  /** Simple AI – makes a random move for "O" after X has played. */
  useEffect(() => {
    if (!ai) return;
    if (winnerInfo.winner) return;
    if (xIsNext) return; // AI plays only when it's O's turn

    const emptyIndices = internalBoard
      .map((v, idx) => (v === "" ? idx : null))
      .filter((v): v is number => v !== null);
    if (emptyIndices.length === 0) return;

    const randomIdx =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    internalHandleClick(randomIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xIsNext, internalBoard, ai, winnerInfo.winner]);

  /** Determine which board & line to render. */
  const displayedBoard = externalBoard ?? internalBoard;
  const displayedLine = externalLine ?? winnerInfo.line;

  /** Choose click handler – external overrides internal. */
  const handleClick = externalClick ?? internalHandleClick;

  /** Render a single cell. */
  const renderCell = (i: number) => {
    const highlight = displayedLine?.includes(i) ?? false;
    return (
      <Cell
        key={i}
        value={displayedBoard[i]}
        onClick={() => handleClick(i)}
        highlight={highlight}
      />
    );
  };

  return (
    <div className={styles.container}>
      {/* The board itself is forced to stay square and responsive */}
      <div
        className={styles.board}
        style={{ width: boardSize, height: boardSize }}
        data-testid="board"
      >
        {Array.from({ length: 9 }, (_, i) => renderCell(i))}
      </div>

      {/* UI shown only when the component manages its own state */}
      {externalBoard === undefined && (
        <div className={styles.info}>
          {winnerInfo.winner ? (
            winnerInfo.winner === "Draw" ? (
              <p>It&apos; s a draw!</p>
            ) : (
              <p>Winner: {winnerInfo.winner}</p>
            )
          ) : (
            <p>Next player: {xIsNext ? "X" : "O"}</p>
          )}
          <button onClick={resetGame} className={styles.resetButton}>
            Reset
          </button>
          <div className={styles.scoreboard}>
            <span>X: {score.X}</span>
            <span>O: {score.O}</span>
            <span>Draws: {score.draws}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;