The requested file `src/utils/__tests__/ai.test.ts` has been fully implemented. Below is the complete content of the test file.

```typescript
/**
 * Unit tests for the minimax AI implementation.
 *
 * These tests verify that the AI correctly selects optimal moves
 * for various board states in a classic Tic‑Tac‑Toe game.
 *
 * The AI is expected to expose a function `getBestMove(board, player)`
 * where:
 *   - `board` is an array of 9 elements representing the cells.
 *     Each cell can be "X", "O", or null/undefined for empty.
 *   - `player` is the symbol ("