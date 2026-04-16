import React from "react";
import styles from "../styles/App.module.css";

type UndoButtonProps = {
  /** Callback to undo the last move */
  onUndo: () => void;
  /** If true, the button is disabled (no moves to undo) */
  disabled?: boolean;
};

/**
 * Simple button component that triggers an undo action.
 * It receives an `onUndo` callback and an optional `disabled` flag.
 * The component applies a CSS class `undoButton` if it exists in the
 * imported stylesheet; otherwise it falls back to the default button styling.
 */
const UndoButton: React.FC<UndoButtonProps> = ({
  onUndo,
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onUndo();
    }
  };

  // Use the `undoButton` class from the CSS module if present.
  const className = (styles as Record<string, string>)["undoButton"] ?? undefined;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      Undo
    </button>
  );
};

export default UndoButton;