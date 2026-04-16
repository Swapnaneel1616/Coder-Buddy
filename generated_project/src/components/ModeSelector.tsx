import React from "react";

type GameMode = "pvp" | "pvai";
type AIDifficulty = "easy" | "medium" | "hard";

interface ModeSelectorProps {
  /** Currently selected mode */
  mode: GameMode;
  /** Callback invoked when the user selects a different mode */
  onChange: (mode: GameMode) => void;
  /** Currently selected AI difficulty (relevant only when `mode` is "pvai") */
  difficulty?: AIDifficulty;
  /** Callback invoked when the user selects a different AI difficulty */
  onDifficultyChange?: (difficulty: AIDifficulty) => void;
}

/**
 * ModeSelector – UI widget that lets the user choose between
 * Player‑vs‑Player (`pvp`) and Player‑vs‑AI (`pvai`) game modes.
 *
 * When the AI mode is selected, an additional set of radio buttons appears
 * allowing the user to pick the AI difficulty (`easy`, `medium`, `hard`).
 *
 * The component is deliberately UI‑agnostic: it only renders simple
 * HTML controls and forwards selections via the supplied callbacks.
 *
 * Defensive behaviour:
 *  - If callbacks are omitted they become no‑ops, preventing crashes.
 *  - Unexpected `mode` values fall back to `"pvp"`.
 *  - Unexpected `difficulty` values fall back to `"medium"`.
 */
const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onChange,
  difficulty = "medium",
  onDifficultyChange,
}) => {
  // Ensure we always work with a known mode value.
  const safeMode: GameMode = mode === "pvai" ? "pvai" : "pvp";

  // Ensure we always work with a known difficulty value.
  const safeDifficulty: AIDifficulty = ["easy", "medium", "hard"].includes(
    difficulty as string
  )
    ? (difficulty as AIDifficulty)
    : "medium";

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.value as GameMode;
    if (onChange) {
      onChange(selected);
    }
  };

  const handleDifficultyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = event.target.value as AIDifficulty;
    if (onDifficultyChange) {
      onDifficultyChange(selected);
    }
  };

  return (
    <fieldset
      style={{
        border: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
      aria-label="Game mode selector"
    >
      <legend style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
        Choose Game Mode
      </legend>

      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="radio"
          name="game-mode"
          value="pvp"
          checked={safeMode === "pvp"}
          onChange={handleModeChange}
        />
        Player vs Player
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="radio"
          name="game-mode"
          value="pvai"
          checked={safeMode === "pvai"}
          onChange={handleModeChange}
        />
        Player vs AI
      </label>

      {safeMode === "pvai" && (
        <fieldset
          style={{
            border: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
          aria-label="AI difficulty selector"
        >
          <legend style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
            AI Difficulty
          </legend>

          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="radio"
              name="ai-difficulty"
              value="easy"
              checked={safeDifficulty === "easy"}
              onChange={handleDifficultyChange}
            />
            Easy
          </label>

          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="radio"
              name="ai-difficulty"
              value="medium"
              checked={safeDifficulty === "medium"}
              onChange={handleDifficultyChange}
            />
            Medium
          </label>

          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="radio"
              name="ai-difficulty"
              value="hard"
              checked={safeDifficulty === "hard"}
              onChange={handleDifficultyChange}
            />
            Hard
          </label>
        </fieldset>
      )}
    </fieldset>
  );
};

export default ModeSelector;