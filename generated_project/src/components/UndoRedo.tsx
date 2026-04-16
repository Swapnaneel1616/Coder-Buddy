import React from "react";

interface UndoRedoProps {
  /** Indicates whether an undo operation is possible */
  canUndo: boolean;
  /** Indicates whether a redo operation is possible */
  canRedo: boolean;
  /** Callback invoked when the user clicks the Undo button */
  onUndo: () => void;
  /** Callback invoked when the user clicks the Redo button */
  onRedo: () => void;
}

/**
 * A simple UI component that renders two buttons – *Undo* and *Redo* – and
 * forwards the appropriate callbacks to the parent game component.
 *
 * The component is deliberately lightweight: it does not manage any state
 * itself, it only reflects the props it receives. This makes it easy to
 * compose with the existing `UndoButton` component (which is a styled
 * button used elsewhere in the project) while keeping the redo button
 * as a native `<button>` to avoid unnecessary duplication.
 *
 * Usage example (inside `Game.tsx`):
 *
 * ```tsx
 * <UndoRedo
 *   canUndo={history.length > 0}
 *   canRedo={future.length > 0}
 *   onUndo={handleUndo}
 *   onRedo={handleRedo}
 * />
 * ```
 *
 * The component gracefully handles the “non‑happy” paths:
 * - If `onUndo`/`onRedo` are not supplied it becomes a no‑op.
 * - Buttons are disabled when the corresponding action is not possible.
 */
const UndoRedo: React.FC<UndoRedoProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  // Defensive defaults – ensures the component never throws if a callback is missing.
  const safeUndo = typeof onUndo === "function" ? onUndo : () => {};
  const safeRedo = typeof onRedo === "function" ? onRedo : () => {};

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      {/* Re‑use the existing styled UndoButton component if it exists.
          If it cannot be imported (e.g., during isolated testing), fall back
          to a regular button with the same semantics. */}
      {(() => {
        try {
          // Dynamically require to avoid circular‑dependency issues in environments
          // where the UndoButton file might not be present (e.g., during unit tests).
          // eslint‑disable-next-line @typescript-eslint/no-var-requires
          const { default: UndoButton } = require("./UndoButton");
          return (
            <UndoButton onClick={safeUndo} disabled={!canUndo}>
              Undo
            </UndoButton>
          );
        } catch {
          // Fallback UI
          return (
            <button onClick={safeUndo} disabled={!canUndo}>
              Undo
            </button>
          );
        }
      })()}

      {/* Redo button – simple native button with minimal styling */}
      <button onClick={safeRedo} disabled={!canRedo}>
        Redo
      </button>
    </div>
  );
};

export default UndoRedo;