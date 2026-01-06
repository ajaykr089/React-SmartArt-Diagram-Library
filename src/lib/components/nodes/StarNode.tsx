import React from 'react';
import { BaseNode } from './BaseNode';
import { DiagramNode } from '../../types/diagram';

interface StarNodeProps {
  node: DiagramNode;
  isSelected: boolean;
  editable: boolean;
  onClick: (node: DiagramNode, event: React.MouseEvent) => void;
  onMouseDown: (node: DiagramNode, event: React.MouseEvent) => void;
}

export const StarNode: React.FC<StarNodeProps> = ({
  node,
  isSelected,
  editable,
  onClick,
  onMouseDown
}) => {
  const centerX = node.position.x + node.size.width / 2;
  const centerY = node.position.y + node.size.height / 2;
  const outerRadius = Math.min(node.size.width, node.size.height) / 2;
  const innerRadius = outerRadius * 0.5;

  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  return (
    <BaseNode
      node={node}
      isSelected={isSelected}
      editable={editable}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <polygon points={points.join(' ')} />
    </BaseNode>
  );
};
