import React from 'react';
import { BaseNode } from './BaseNode';
import { DiagramNode } from '../../types/diagram';

interface CircleNodeProps {
  node: DiagramNode;
  isSelected: boolean;
  editable: boolean;
  onClick: (node: DiagramNode, event: React.MouseEvent) => void;
  onMouseDown: (node: DiagramNode, event: React.MouseEvent) => void;
}

export const CircleNode: React.FC<CircleNodeProps> = ({
  node,
  isSelected,
  editable,
  onClick,
  onMouseDown
}) => {
  const centerX = node.position.x + node.size.width / 2;
  const centerY = node.position.y + node.size.height / 2;
  const radius = Math.min(node.size.width, node.size.height) / 2;

  return (
    <BaseNode
      node={node}
      isSelected={isSelected}
      editable={editable}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
      />
    </BaseNode>
  );
};
