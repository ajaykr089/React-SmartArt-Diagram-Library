import React from 'react';
import { Button, ButtonGroup } from 'rsuite';

interface ToolbarProps {
  onAddNode: () => void;
  onAddEdge: () => void;
  canAddEdge: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onAddEdge,
  canAddEdge
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 10,
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <ButtonGroup>
        <Button
          appearance="primary"
          size="sm"
          onClick={onAddNode}
        >
          Add Node
        </Button>

        <Button
          appearance="primary"
          color="green"
          size="sm"
          disabled={!canAddEdge}
          onClick={onAddEdge}
        >
          Add Edge
        </Button>
      </ButtonGroup>
    </div>
  );
};
