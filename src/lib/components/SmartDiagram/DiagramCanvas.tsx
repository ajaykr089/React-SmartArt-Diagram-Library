import React, { useState, useRef, useCallback } from 'react';
import { SmartDiagramData, DiagramNode, DiagramEdge, Position } from '../../types/diagram';
import { useTheme } from '../../themes/ThemeProvider';
import { useKeyboard, createDiagramShortcuts } from '../../hooks/useKeyboard';
import { NodeRenderer } from './NodeRenderer';
import { EdgeRenderer } from './EdgeRenderer';

interface DiagramCanvasProps {
  data: SmartDiagramData;
  width: string | number;
  height: string | number;
  editable: boolean;
  selectedNode: DiagramNode | null;
  selectedEdge: DiagramEdge | null;
  onChange: (data: SmartDiagramData) => void;
  onNodeSelect: (node: DiagramNode) => void;
  onEdgeSelect: (edge: DiagramEdge) => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  data,
  width,
  height,
  editable,
  selectedNode,
  selectedEdge,
  onChange,
  onNodeSelect,
  onEdgeSelect
}) => {
  const [draggingNode, setDraggingNode] = useState<DiagramNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<DiagramNode | null>(null);
  const [connectingTo, setConnectingTo] = useState<Position | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Use theme hook
  const { theme } = useTheme();

  // Keyboard shortcuts
  const keyboardShortcuts = createDiagramShortcuts({
    delete: () => {
      if (selectedNode) {
        const updatedNodes = data.nodes.filter(node => node.id !== selectedNode.id);
        const updatedEdges = data.edges.filter(edge =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
        );
        const newData = {
          ...data,
          nodes: updatedNodes,
          edges: updatedEdges,
          metadata: { ...data.metadata, updatedAt: new Date() }
        };
        onChange(newData);
      } else if (selectedEdge) {
        const updatedEdges = data.edges.filter(edge => edge.id !== selectedEdge.id);
        const newData = {
          ...data,
          edges: updatedEdges,
          metadata: { ...data.metadata, updatedAt: new Date() }
        };
        onChange(newData);
      }
    },
    addNode: () => {
      const newNode: DiagramNode = {
        id: `node-${Date.now()}`,
        type: 'rectangle',
        position: {
          x: Math.random() * 300 + 50,
          y: Math.random() * 200 + 50
        },
        size: { width: 120, height: 60 },
        data: {
          label: `Node ${data.nodes.length + 1}`,
          style: theme.node.default
        }
      };
      const newData = {
        ...data,
        nodes: [...data.nodes, newNode],
        metadata: { ...data.metadata, updatedAt: new Date() }
      };
      onChange(newData);
    },
    addEdge: () => {
      if (!selectedNode || data.nodes.length < 2) return;
      const availableTargets = data.nodes.filter(n => n.id !== selectedNode.id);
      if (availableTargets.length === 0) return;
      const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
      const newEdge: DiagramEdge = {
        id: `edge-${Date.now()}`,
        source: selectedNode.id,
        target: randomTarget.id,
        type: 'straight',
        data: {
          label: 'Connection',
          style: theme.edge.default
        }
      };
      const newData = {
        ...data,
        edges: [...data.edges, newEdge],
        metadata: { ...data.metadata, updatedAt: new Date() }
      };
      onChange(newData);
    }
  });

  // Initialize keyboard shortcuts
  useKeyboard({
    enabled: editable,
    shortcuts: keyboardShortcuts,
    target: containerRef.current || undefined
  });

  const handleNodeClick = useCallback((node: DiagramNode, event: React.MouseEvent) => {
    event.stopPropagation();
    onNodeSelect(node);
  }, [onNodeSelect]);

  const handleEdgeClick = useCallback((edge: DiagramEdge, event: React.MouseEvent) => {
    event.stopPropagation();
    onEdgeSelect(edge);
  }, [onEdgeSelect]);

  const handleCanvasClick = useCallback(() => {
    // Clear selections when clicking on empty canvas
  }, []);

  const handleNodeMouseDown = useCallback((node: DiagramNode, event: React.MouseEvent) => {
    if (!editable || !containerRef.current) return;

    event.stopPropagation();

    // Check if Ctrl key is pressed - if so, start connection mode instead of dragging
    if (event.ctrlKey || event.metaKey) {
      setConnectingFrom(node);
      setConnectingTo({
        x: event.clientX - containerRef.current.getBoundingClientRect().left,
        y: event.clientY - containerRef.current.getBoundingClientRect().top
      });
      return;
    }

    // Regular node dragging
    setDraggingNode(node);

    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left - node.position.x,
      y: event.clientY - rect.top - node.position.y
    });
  }, [editable]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    // Handle connection preview line
    if (connectingFrom && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setConnectingTo({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
      return;
    }

    // Handle node dragging
    if (!draggingNode || !editable || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = {
      x: event.clientX - rect.left - dragOffset.x,
      y: event.clientY - rect.top - dragOffset.y
    };

    const updatedNodes = data.nodes.map(node =>
      node.id === draggingNode.id
        ? { ...node, position: newPosition }
        : node
    );

    const newData = {
      ...data,
      nodes: updatedNodes,
      metadata: { ...data.metadata, updatedAt: new Date() }
    };

    onChange(newData);
  }, [connectingFrom, draggingNode, dragOffset, editable, data, onChange]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    // Handle connection completion
    if (connectingFrom && connectingTo && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Check if mouse is over a valid target node
      const targetNode = data.nodes.find(node => {
        // Check if mouse is within node's bounds
        return mouseX >= node.position.x &&
               mouseX <= node.position.x + node.size.width &&
               mouseY >= node.position.y &&
               mouseY <= node.position.y + node.size.height &&
               node.id !== connectingFrom.id;
      });

      if (targetNode) {
        // Create the edge
        const newEdge: DiagramEdge = {
          id: `edge-${Date.now()}`,
          source: connectingFrom.id,
          target: targetNode.id,
          type: 'straight',
          data: {
            label: 'Connection',
            style: {
              strokeColor: '#6B7280',
              strokeWidth: 2,
              arrowhead: 'arrow'
            }
          }
        };

        const newData = {
          ...data,
          edges: [...data.edges, newEdge],
          metadata: { ...data.metadata, updatedAt: new Date() }
        };

        onChange(newData);
      }

      // Reset connection state
      setConnectingFrom(null);
      setConnectingTo(null);
    }

    // Reset dragging state
    setDraggingNode(null);
  }, [connectingFrom, connectingTo, data, onChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!editable) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedNode) {
        const updatedNodes = data.nodes.filter(node => node.id !== selectedNode.id);
        const updatedEdges = data.edges.filter(edge =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
        );

        const newData = {
          ...data,
          nodes: updatedNodes,
          edges: updatedEdges,
          metadata: { ...data.metadata, updatedAt: new Date() }
        };

        onChange(newData);
      } else if (selectedEdge) {
        const updatedEdges = data.edges.filter(edge => edge.id !== selectedEdge.id);
        const newData = {
          ...data,
          edges: updatedEdges,
          metadata: { ...data.metadata, updatedAt: new Date() }
        };

        onChange(newData);
      }
    }
  }, [editable, selectedNode, selectedEdge, data, onChange]);

  return (
    <div
      ref={containerRef}
      className="diagram-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onClick={handleCanvasClick}
        className={draggingNode ? 'diagram-svg-grabbing' : 'diagram-svg-default'}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6B7280"
            />
          </marker>
        </defs>

        {/* Render edges first */}
        <EdgeRenderer
          edges={data.edges}
          nodes={data.nodes}
          selectedEdge={selectedEdge}
          onEdgeClick={handleEdgeClick}
        />

        {/* Render nodes */}
        <NodeRenderer
          nodes={data.nodes}
          selectedNode={selectedNode}
          editable={editable}
          theme={theme}
          onNodeClick={handleNodeClick}
          onNodeMouseDown={handleNodeMouseDown}
        />

        {/* Connection preview line */}
        {connectingFrom && connectingTo && (
          <line
            x1={connectingFrom.position.x + connectingFrom.size.width / 2}
            y1={connectingFrom.position.y + connectingFrom.size.height / 2}
            x2={connectingTo.x}
            y2={connectingTo.y}
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
          />
        )}
      </svg>

      {/* Instructions overlay */}
      {editable && data.nodes.length === 0 && (
        <div className="diagram-overlay">
          <div className="diagram-overlay-icon">📊</div>
          <div className="diagram-overlay-title">Interactive Diagram Canvas</div>
          <div className="diagram-overlay-text">Click "Add Node" to get started</div>
        </div>
      )}
    </div>
  );
};
