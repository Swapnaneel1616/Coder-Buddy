import { useState } from "react";
import {
  Board,
  Player,
  makeMove as makeMoveLogic,
  checkWinner,
  isDraw,
} from "../utils/gameLogic";
import { getBestMove } from "../utils/ai";

export type GameState = {
  board: Board;
  turn: Player;
  history: Board[];
  winner: Player | null;
  draw: boolean;
};

const emptyBoard = Array(9).fill(null) as Board;

export function useGame(mode: "PvP" | "PvAI") {
  const initialState: GameState = {
    board: emptyBoard,
    turn: "X" as Player,
    history: [],
    winner: null,
    draw: false,
  };

  const [state, setState] = useState<GameState>(initialState);

  const reset = () => setState(initialState);

  const undo = () => {
    if (state.history.length === 0) return;

    const previousBoard = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    const previousTurn: Player = state.turn === "X" ? "O" : "X";
    const winner = checkWinner(previousBoard);
    const draw = !winner && isDraw(previousBoard);

    setState({
      board: previousBoard,
      turn: previousTurn,
      history: newHistory,
      winner,
      draw,
    });
  };

  const makeMove = (idx: number) => {
    if (state.winner || state.draw) return;
    if (state.board[idx] !== null) return;

    // Player (human) move
    const playerBoard = makeMoveLogic(state.board, idx, state.turn);
    const playerWinner = checkWinner(playerBoard);
    const playerDraw = !playerWinner && isDraw(playerBoard);
    const nextTurnAfterPlayer: Player = state.turn === "X" ? "O" : "X";
    const playerHistory = [...state.history, state.board];

    setState({
      board: playerBoard,
      turn: nextTurnAfterPlayer,
      history: playerHistory,
      winner: playerWinner,
      draw: playerDraw,
    });

    // If AI mode, let AI play immediately after the human move
    if (
      mode === "PvAI" &&
      !playerWinner &&
      !playerDraw &&
      nextTurnAfterPlayer === "O"
    ) {
      const aiIdx = getBestMove(playerBoard, "O");
      if (aiIdx === -1) return; // no valid moves (should not happen)

      const aiBoard = makeMoveLogic(playerBoard, aiIdx, "O");
      const aiWinner = checkWinner(aiBoard);
      const aiDraw = !aiWinner && isDraw(aiBoard);
      const nextTurnAfterAI: Player = aiWinner ? "O" : "X";
      const aiHistory = [...playerHistory, playerBoard];

      setState({
        board: aiBoard,
        turn: nextTurnAfterAI,
        history: aiHistory,
        winner: aiWinner,
        draw: aiDraw,
      });
    }
  };

  return {
    state,
    makeMove,
    undo,
    reset,
  };
}