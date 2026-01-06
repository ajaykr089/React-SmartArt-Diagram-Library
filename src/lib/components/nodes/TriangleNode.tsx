import React from 'react';
import { BaseNode } from './BaseNode';
import { DiagramNode } from '../../types/diagram';

interface TriangleNodeProps {
  node: DiagramNode;
  isSelected: boolean;
  editable: boolean;
  onClick: (node: DiagramNode, event: React.MouseEvent) => void;
  onMouseDown: (node: DiagramNode, event: React.MouseEvent) => void;
}

export const TriangleNode: React.FC<TriangleNodeProps> = ({
  node,
  isSelected,
  editable,
  onClick,
  onMouseDown
}) => {
  const points = [
    node.position.x + node.size.width / 2, node.position.y, // top
    node.position.x, node.position.y + node.size.height, // bottom left
    node.position.x + node.size.width, node.position.y + node.size.height // bottom right
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
