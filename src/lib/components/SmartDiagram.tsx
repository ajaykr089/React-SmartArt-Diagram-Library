import React, { useState, useRef, useCallback } from 'react';
import { SmartDiagramData, DiagramNode, DiagramEdge, Position } from '../types/diagram';

interface SmartDiagramProps {
  data: SmartDiagramData;
  width?: string | number;
  height?: string | number;
  editable?: boolean;
  onChange?: (data: SmartDiagramData) => void;
  onNodeSelect?: (node: DiagramNode) => void;
  onEdgeSelect?: (edge: DiagramEdge) => void;
}

export const SmartDiagram: React.FC<SmartDiagramProps> = ({
  data,
  width = '100%',
  height = '100%',
  editable = true,
  onChange,
  onNodeSelect,
  onEdgeSelect
}) => {
  const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<DiagramEdge | null>(null);
  const [draggingNode, setDraggingNode] = useState<DiagramNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<DiagramNode | null>(null);
  const [connectingTo, setConnectingTo] = useState<Position | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleNodeClick = useCallback((node: DiagramNode, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedNode(node);
    setSelectedEdge(null);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const handleEdgeClick = useCallback((edge: DiagramEdge, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setSelectedNode(null);
    onEdgeSelect?.(edge);
  }, [onEdgeSelect]);

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
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
      nodes: updatedNodes
    };

    onChange?.(newData);
  }, [connectingFrom, draggingNode, dragOffset, editable, data, onChange]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    // Handle connection completion
    if (connectingFrom && connectingTo && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Check if mouse is over a valid target node
      const targetNode = data.nodes.find(node => {
        const nodeCenterX = node.position.x + node.size.width / 2;
        const nodeCenterY = node.position.y + node.size.height / 2;
        const distance = Math.sqrt(
          Math.pow(mouseX - nodeCenterX, 2) + Math.pow(mouseY - nodeCenterY, 2)
        );

        // Check if mouse is within node's bounds (simple rectangular check)
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
          edges: [...data.edges, newEdge]
        };

        onChange?.(newData);
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
          edges: updatedEdges
        };

        onChange?.(newData);
        setSelectedNode(null);
      } else if (selectedEdge) {
        const updatedEdges = data.edges.filter(edge => edge.id !== selectedEdge.id);
        const newData = {
          ...data,
          edges: updatedEdges
        };

        onChange?.(newData);
        setSelectedEdge(null);
      }
    }
  }, [editable, selectedNode, selectedEdge, data, onChange]);

  const getNodeElement = (node: DiagramNode) => {
    const isSelected = selectedNode?.id === node.id;
    const fill = node.data.style?.backgroundColor || '#10B981';
    const stroke = isSelected ? '#EF4444' : (node.data.style?.borderColor || '#1F2937');
    const strokeWidth = isSelected ? 3 : 1;
    const cursor = editable ? 'pointer' : 'default';

    const centerX = node.position.x + node.size.width / 2;
    const centerY = node.position.y + node.size.height / 2;

    switch (node.type) {
      case 'circle':
        return (
          <circle
            key={node.id}
            cx={centerX}
            cy={centerY}
            r={Math.min(node.size.width, node.size.height) / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'ellipse':
        return (
          <ellipse
            key={node.id}
            cx={centerX}
            cy={centerY}
            rx={node.size.width / 2}
            ry={node.size.height / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'diamond':
        const diamondPoints = [
          centerX, node.position.y, // top
          node.position.x + node.size.width, centerY, // right
          centerX, node.position.y + node.size.height, // bottom
          node.position.x, centerY // left
        ].join(',');
        return (
          <polygon
            key={node.id}
            points={diamondPoints}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'triangle':
        const trianglePoints = [
          centerX, node.position.y, // top
          node.position.x, node.position.y + node.size.height, // bottom left
          node.position.x + node.size.width, node.position.y + node.size.height // bottom right
        ].join(',');
        return (
          <polygon
            key={node.id}
            points={trianglePoints}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'hexagon':
        const hexRadius = Math.min(node.size.width, node.size.height) / 2;
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = centerX + hexRadius * Math.cos(angle);
          const y = centerY + hexRadius * Math.sin(angle);
          hexPoints.push(`${x},${y}`);
        }
        return (
          <polygon
            key={node.id}
            points={hexPoints.join(' ')}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'pentagon':
        const pentRadius = Math.min(node.size.width, node.size.height) / 2;
        const pentPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = centerX + pentRadius * Math.cos(angle);
          const y = centerY + pentRadius * Math.sin(angle);
          pentPoints.push(`${x},${y}`);
        }
        return (
          <polygon
            key={node.id}
            points={pentPoints.join(' ')}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'star':
        const starPoints = [];
        const outerRadius = Math.min(node.size.width, node.size.height) / 2;
        const innerRadius = outerRadius * 0.5;
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          starPoints.push(`${x},${y}`);
        }
        return (
          <polygon
            key={node.id}
            points={starPoints.join(' ')}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'parallelogram':
        const paraPoints = [
          node.position.x + 20, node.position.y, // top left
          node.position.x + node.size.width, node.position.y, // top right
          node.position.x + node.size.width - 20, node.position.y + node.size.height, // bottom right
          node.position.x, node.position.y + node.size.height // bottom left
        ].join(',');
        return (
          <polygon
            key={node.id}
            points={paraPoints}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'trapezoid':
        const trapPoints = [
          node.position.x + 20, node.position.y, // top left
          node.position.x + node.size.width - 20, node.position.y, // top right
          node.position.x + node.size.width, node.position.y + node.size.height, // bottom right
          node.position.x, node.position.y + node.size.height // bottom left
        ].join(',');
        return (
          <polygon
            key={node.id}
            points={trapPoints}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'rounded-rectangle':
        return (
          <rect
            key={node.id}
            x={node.position.x}
            y={node.position.y}
            width={node.size.width}
            height={node.size.height}
            rx={Math.min(node.size.width, node.size.height) / 4}
            ry={Math.min(node.size.width, node.size.height) / 4}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );

      case 'rectangle':
      default:
        return (
          <rect
            key={node.id}
            x={node.position.x}
            y={node.position.y}
            width={node.size.width}
            height={node.size.height}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            style={{ cursor }}
            onClick={(e) => handleNodeClick(node, e)}
            onMouseDown={(e) => handleNodeMouseDown(node, e)}
          />
        );
    }
  };

  const getEdgeElement = (edge: DiagramEdge) => {
    const sourceNode = data.nodes.find(n => n.id === edge.source);
    const targetNode = data.nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;

    const sourceX = sourceNode.position.x + sourceNode.size.width / 2;
    const sourceY = sourceNode.position.y + sourceNode.size.height / 2;
    const targetX = targetNode.position.x + targetNode.size.width / 2;
    const targetY = targetNode.position.y + targetNode.size.height / 2;

    const isSelected = selectedEdge?.id === edge.id;

    return (
      <g key={edge.id}>
        <line
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
          stroke={isSelected ? '#EF4444' : (edge.data.style?.strokeColor || '#6B7280')}
          strokeWidth={isSelected ? 3 : (edge.data.style?.strokeWidth || 2)}
          markerEnd={edge.data.style?.arrowhead === 'arrow' ? 'url(#arrowhead)' : undefined}
          style={{ cursor: 'pointer' }}
          onClick={(e) => handleEdgeClick(edge, e)}
        />
        {edge.data.label && (
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 5}
            textAnchor="middle"
            className="diagram-edge-label"
          >
            {edge.data.label}
          </text>
        )}
      </g>
    );
  };

  const getNodeLabel = (node: DiagramNode) => {
    const centerX = node.position.x + node.size.width / 2;
    const centerY = node.position.y + node.size.height / 2;

    return (
      <text
        key={`label-${node.id}`}
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="diagram-node-label"
        style={{
          fontSize: node.data.style?.fontSize || 14,
          fill: node.data.style?.textColor || '#FFFFFF'
        }}
      >
        {node.data.label}
      </text>
    );
  };

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
        {data.edges.map(getEdgeElement)}

        {/* Render nodes */}
        {data.nodes.map(getNodeElement)}

        {/* Render node labels */}
        {data.nodes.map(getNodeLabel)}

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
