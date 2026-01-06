import React from 'react';
import { BaseNode } from './BaseNode';
import { DiagramNode } from '../../types/diagram';

interface EllipseNodeProps {
  node: DiagramNode;
  isSelected: boolean;
  editable: boolean;
  onClick: (node: DiagramNode, event: React.MouseEvent) => void;
  onMouseDown: (node: DiagramNode, event: React.MouseEvent) => void;
}

export const EllipseNode: React.FC<EllipseNodeProps> = ({
  node,
  isSelected,
  editable,
  onClick,
  onMouseDown
}) => {
  const centerX = node.position.x + node.size.width / 2;
  const centerY = node.position.y + node.size.height / 2;
  const radiusX = node.size.width / 2;
  const radiusY = node.size.height / 2;

  return (
    <BaseNode
      node={node}
      isSelected={isSelected}
      editable={editable}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={radiusX}
        ry={radiusY}
      />
    </BaseNode>
  );
};
