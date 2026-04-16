import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import ScoreBoard from './components/ScoreBoard';
import ModeSelector from './components/ModeSelector';
import ThemeToggle from './components/ThemeToggle';
import UndoRedo from './components/UndoRedo';
import {
  isValidMove,
  makeMove,
  checkWinner,
  isDraw,
  Player,
} from './utils/gameLogic';
import styles from './styles/App.module.css';

const App: React.FC = () => {
  /*** Game board ***/
  const initialBoard = Array(9).fill('');
  const [history, setHistory] = useState<string[][]>([initialBoard]);
  const [step, setStep] = useState(0); // points to current board in history
  const board = history[step];
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.X);
  const [statusMessage, setStatusMessage] = useState<string>(
    `Player ${Player.X}'s turn`
  );

  /*** Mode selection – human vs human or human vs AI ***/
  const [mode, setMode] = useState<'human' | 'ai'>('human');

  /*** Score persistence ***/
  const [scores, setScores] = useState<{ X: number; O: number; Draw: number }>(
    { X: 0, O: 0, Draw: 0 }
  );

  // Load scores from localStorage once on mount
  useEffect(() => {
    const saved = localStorage.getItem('ticTacToeScores');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScores(parsed);
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  // Helper to persist scores
  const persistScores = (newScores: typeof scores) => {
    localStorage.setItem('ticTacToeScores', JSON.stringify(newScores));
  };

  /*** Core move handling ***/
  const processMove = (
    index: number,
    player: Player,
    boardState: string[]
  ): { newBoard: string[]; gameOver: boolean } => {
    const newBoard = makeMove(boardState, index, player);
    // Update history (trim any redo steps)
    const newHistory = history.slice(0, step + 1).concat([newBoard]);
    setHistory(newHistory);
    setStep(step + 1);
    setBoard(newBoard);

    // Win detection
    if (checkWinner(newBoard, player)) {
      setStatusMessage(`Player ${player} wins!`);
      const key = player === Player.X ? 'X' : 'O';
      const updated = { ...scores, [key]: scores[key] + 1 };
      setScores(updated);
      persistScores(updated);
      return { newBoard, gameOver: true };
    }

    // Draw detection
    if (isDraw(newBoard)) {
      setStatusMessage('Draw!');
      const updated = { ...scores, Draw: scores.Draw + 1 };
      setScores(updated);
      persistScores(updated);
      return { newBoard, gameOver: true };
    }

    // Continue game
    const nextPlayer = player === Player.X ? Player.O : Player.X;
    setCurrentPlayer(nextPlayer);
    setStatusMessage(`Player ${nextPlayer}'s turn`);
    return { newBoard, gameOver: false };
  };

  // Helper to directly set board (used after undo/redo)
  const setBoard = (b: string[]) => {
    // we keep board derived from history, so this is just a convenience
    // No side‑effects other than forcing a re‑render
    // eslint‑disable-next-line @typescript-eslint/no-unused-vars
    const _ = b;
  };

  const