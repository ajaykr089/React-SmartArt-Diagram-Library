import React from 'react';
import { DiagramNode } from '../../types/diagram';

interface BaseNodeProps {
  node: DiagramNode;
  isSelected: boolean;
  editable: boolean;
  onClick: (node: DiagramNode, event: React.MouseEvent) => void;
  onMouseDown: (node: DiagramNode, event: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  node,
  isSelected,
  editable,
  onClick,
  onMouseDown,
  children
}) => {
  const fill = node.data.style?.backgroundColor || '#10B981';
  const stroke = isSelected ? '#EF4444' : (node.data.style?.borderColor || '#1F2937');
  const strokeWidth = isSelected ? 3 : 1;
  const cursor = editable ? 'pointer' : 'default';

  return (
    <g
      style={{ cursor }}
      onClick={(e) => onClick(node, e)}
      onMouseDown={(e) => onMouseDown(node, e)}
    >
      {React.cloneElement(children as React.ReactElement, {
        fill,
        stroke,
        strokeWidth
      })}
    </g>
  );
};
