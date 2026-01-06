import React from 'react';

interface DragHandleProps {
  x: number;
  y: number;
  size?: number;
  onMouseDown: (event: React.MouseEvent) => void;
  className?: string;
  visible?: boolean;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  x,
  y,
  size = 8,
  onMouseDown,
  className = 'diagram-drag-handle',
  visible = true
}) => {
  if (!visible) return null;

  return (
    <circle
      cx={x}
      cy={y}
      r={size / 2}
      className={className}
      onMouseDown={onMouseDown}
      style={{
        cursor: 'move',
        fill: 'var(--theme-primary)',
        stroke: 'var(--theme-background)',
        strokeWidth: 1,
        opacity: 0.8
      }}
    />
  );
};
