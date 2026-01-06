import React from 'react';
import { BaseNode } from './BaseNode';
import { DiagramNode } from '../../types/diagram';

interface DiamondNodeProps {
  node: DiagramNode;
  isSelected: boolean;
  editable: boolean;
  onClick: (node: DiagramNode, event: React.MouseEvent) => void;
  onMouseDown: (node: DiagramNode, event: React.MouseEvent) => void;
}

export const DiamondNode: React.FC<DiamondNodeProps> = ({
  node,
  isSelected,
  editable,
  onClick,
  onMouseDown
}) => {
  const centerX = node.position.x + node.size.width / 2;
  const centerY = node.position.y + node.size.height / 2;

  const points = [
    centerX, node.position.y, // top
    node.position.x + node.size.width, centerY, // right
    centerX, node.position.y + node.size.height, // bottom
    node.position.x, centerY // left
  ].join(',');

  return (
    <BaseNode
      node={node}
      isSelected={isSelected}
      editable={editable}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <polygon points={points} />
    </BaseNode>
  );
};
