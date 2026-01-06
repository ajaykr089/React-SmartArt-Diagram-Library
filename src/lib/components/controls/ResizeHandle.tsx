import React from 'react';

interface ResizeHandleProps {
  x: number;
  y: number;
  size?: number;
  direction: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
  onMouseDown: (event: React.MouseEvent, direction: string) => void;
  className?: string;
  visible?: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  x,
  y,
  size = 8,
  direction,
  onMouseDown,
  className = 'diagram-resize-handle',
  visible = true
}) => {
  if (!visible) return null;

  const getCursor = (dir: string) => {
    switch (dir) {
      case 'nw': return 'nw-resize';
      case 'n': return 'n-resize';
      case 'ne': return 'ne-resize';
      case 'e': return 'e-resize';
      case 'se': return 'se-resize';
      case 's': return 's-resize';
      case 'sw': return 'sw-resize';
      case 'w': return 'w-resize';
      default: return 'pointer';
    }
  };

  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      className={className}
      onMouseDown={(e) => onMouseDown(e, direction)}
      style={{
        cursor: getCursor(direction),
        fill: 'var(--theme-primary)',
        stroke: 'var(--theme-background)',
        strokeWidth: 1,
        opacity: 0.8
      }}
    />
  );
};

// Component for all resize handles around a node
interface NodeResizeHandlesProps {
  x: number;
  y: number;
  width: number;
  height: number;
  onResizeStart: (event: React.MouseEvent, direction: string) => void;
  visible?: boolean;
}

export const NodeResizeHandles: React.FC<NodeResizeHandlesProps> = ({
  x,
  y,
  width,
  height,
  onResizeStart,
  visible = true
}) => {
  if (!visible) return null;

  const handleSize = 8;

  return (
    <g>
      {/* Corner handles */}
      <ResizeHandle
        x={x}
        y={y}
        direction="nw"
        onMouseDown={onResizeStart}
        visible={visible}
        size={handleSize}
      />
      <ResizeHandle
        x={x + width}
        y={y}
        direction="ne"
        onMouseDown={onResizeStart}
        visible={visible}
        size={handleSize}
      />
      <ResizeHandle
        x={x + width}
        y={y + height}
        direction="se"
        onMouseDown={onResizeStart}
        visible={visible}
        size={handleSize}
      />
      <ResizeHandle
        x={x}
        y={y + height}
        direction="sw"
        onMouseDown={onResizeStart}
        visible={visible}
        size={handleSize}
      />

      {/* Edge handles */}
      <ResizeHandle
        x={x + width / 2}
        y={y}
        direction="n"
        onMouseDown={onResizeStart}
        visible={visible}
        size={handleSize}
      />
      <ResizeHandle
        x={x + width}
        y={y + height / 2}
        direction="e"
        onMouseDown={onResizeStart}
        visible={visible}
        size={handleSize}
      />
      <ResizeHandle
        x={x + width / 2}
        y={y + height}
        direction="s"
        onMouseDown={onResizeStart}
        visible={visible}
        size={handleSize}
      />
      <ResizeHandle
        x={x}
        y={y + height / 2}
        direction="w"
        onMouseDown={onResizeStart}
        visible={visible}
        size={handleSize}
      />
    </g>
  );
};
