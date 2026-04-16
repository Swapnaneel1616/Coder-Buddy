import React, {
  useEffect,
  useState,
  KeyboardEvent,
  MouseEvent,
  FocusEvent,
} from "react";

type CellProps = {
  /** Zero‑based index of the cell on the board */
  index: number;
  /** Current value of the cell – empty string, "X" or "O" */
  value: string;
  /** Callback invoked when the cell is selected (click or Enter/Space) */
  onClick: (i: number) => void;
};

/**
 * Individual board cell.
 *
 * Handles mouse click, keyboard activation, hover/focus visual feedback,
 * provides accessible ARIA labels, and animates when a move is placed.
 */
export const Cell: React.FC<CellProps> = ({ index, value, onClick }) => {
  // Animation when a move is placed (value changes from empty to X/O)
  const [isAnimating, setIsAnimating] = useState(false);
  // Visual hover/focus state – only shown for empty cells
  const [isHover, setIsHover] = useState(false);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  // Trigger a short animation whenever a new value appears.
  useEffect(() => {
    if (value) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300); // match CSS duration
      return () => clearTimeout(timer);
    }
  }, [value]);

  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------
  const handleClick = () => {
    if (!value) {
      onClick(index);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // prevent scrolling on Space
      handleClick();
    }
  };

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    if (!value) setIsHover(true);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    setIsHover(false);
  };

  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    if (!value) setIsHover(true);
  };

  const handleBlur = (e: FocusEvent<HTMLButtonElement>) => {
    setIsHover(false);
  };

  // -------------------------------------------------------------------------
  // Class name composition
  // -------------------------------------------------------------------------
  const className = [
    "cell",
    value ? value : "",
    isAnimating ? "animate" : "",
    isHover ? "hover" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  const ariaLabel = `Cell ${index + 1} ${
    value ? `occupied by ${value}` : "empty"
  }`;

  return (
    <button
      type="button"
      role="gridcell"
      className={className}
      disabled={!!value}
      aria-label={ariaLabel}
      aria-disabled={!!value}
      data-index={index}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {value}
    </button>
  );
};

export default Cell;