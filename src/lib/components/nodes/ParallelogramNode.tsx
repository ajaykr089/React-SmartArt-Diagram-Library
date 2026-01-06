import React from 'react';
import { BaseNode } from './BaseNode';
import { DiagramNode } from '../../types/diagram';

interface ParallelogramNodeProps {
  node: DiagramNode;
  isSelected: boolean;
  editable: boolean;
  onClick: (node: DiagramNode, event: React.MouseEvent) => void;
  onMouseDown: (node: DiagramNode, event: React.MouseEvent) => void;
}

export const ParallelogramNode: React.FC<ParallelogramNodeProps> = ({
  node,
  isSelected,
  editable,
  onClick,
  onMouseDown
}) => {
  const skew = 20;
  const points = [
    node.position.x + skew, node.position.y, // top left
    node.position.x + node.size.width, node.position.y, // top right
    node.position.x + node.size.width - skew, node.position.y + node.size.height, // bottom right
    node.position.x, node.position.y + node.size.height // bottom left
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
