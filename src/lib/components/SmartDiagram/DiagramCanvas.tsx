import React, { useState, useRef, useCallback } from 'react';
import { SmartDiagramData, DiagramNode, DiagramEdge, Position } from '../../types/diagram';
import { useTheme } from '../../themes/ThemeProvider';
import { useKeyboard, createDiagramShortcuts } from '../../hooks/useKeyboard';
import { NodeRenderer } from './NodeRenderer';
import { EdgeRenderer } from './EdgeRenderer';
import { ContextMenu, createDiagramContextMenu } from '../controls/ContextMenu';

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
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    items: any[];
    target?: DiagramNode | DiagramEdge | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    items: [],
    target: null
  });

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Properties dialog state
  const [propertiesDialog, setPropertiesDialog] = useState<{
    visible: boolean;
    target?: DiagramNode | DiagramEdge | null;
    position: Position;
  }>({
    visible: false,
    target: null,
    position: { x: 0, y: 0 }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Use theme hook
  const { theme } = useTheme();

  // Helper functions for context menu actions
  const handleDeleteNode = useCallback((node: DiagramNode) => {
    const updatedNodes = data.nodes.filter(n => n.id !== node.id);
    const updatedEdges = data.edges.filter(edge =>
      edge.source !== node.id && edge.target !== node.id
    );
    const newData = {
      ...data,
      nodes: updatedNodes,
      edges: updatedEdges,
      metadata: { ...data.metadata, updatedAt: new Date() }
    };
    onChange(newData);
  }, [data, onChange]);

  const handleDeleteEdge = useCallback((edge: DiagramEdge) => {
    const updatedEdges = data.edges.filter(e => e.id !== edge.id);
    const newData = {
      ...data,
      edges: updatedEdges,
      metadata: { ...data.metadata, updatedAt: new Date() }
    };
    onChange(newData);
  }, [data, onChange]);

  const handleCopyNode = useCallback((node: DiagramNode) => {
    // Implementation for copy (store in localStorage for now)
    localStorage.setItem('diagram-clipboard', JSON.stringify(node));
    console.log('Copied node to clipboard:', node);
  }, []);

  const handlePasteNode = useCallback((position?: Position) => {
    const clipboardData = localStorage.getItem('diagram-clipboard');
    if (clipboardData) {
      try {
        const node = JSON.parse(clipboardData) as DiagramNode;
        const newNode: DiagramNode = {
          ...node,
          id: `node-${Date.now()}`,
          position: position || {
            x: node.position.x + 30,
            y: node.position.y + 30
          },
          data: {
            ...node.data,
            label: node.data.label
          }
        };

        const newData = {
          ...data,
          nodes: [...data.nodes, newNode],
          metadata: { ...data.metadata, updatedAt: new Date() }
        };
        onChange(newData);
      } catch (error) {
        console.error('Failed to paste node:', error);
      }
    }
  }, [data, onChange]);

  const handleDuplicateNode = useCallback((node: DiagramNode) => {
    const newNode: DiagramNode = {
      ...node,
      id: `node-${Date.now()}`,
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20
      },
      data: {
        ...node.data,
        label: `${node.data.label} (Copy)`
      }
    };

    const newData = {
      ...data,
      nodes: [...data.nodes, newNode],
      metadata: { ...data.metadata, updatedAt: new Date() }
    };
    onChange(newData);
  }, [data, onChange]);

  const handleBringToFront = useCallback((node: DiagramNode) => {
    const otherNodes = data.nodes.filter(n => n.id !== node.id);
    const newData = {
      ...data,
      nodes: [...otherNodes, node],
      metadata: { ...data.metadata, updatedAt: new Date() }
    };
    onChange(newData);
  }, [data, onChange]);

  const handleSendToBack = useCallback((node: DiagramNode) => {
    const otherNodes = data.nodes.filter(n => n.id !== node.id);
    const newData = {
      ...data,
      nodes: [node, ...otherNodes],
      metadata: { ...data.metadata, updatedAt: new Date() }
    };
    onChange(newData);
  }, [data, onChange]);

  const handleChangeNodeType = useCallback((node: DiagramNode, newType: string) => {
    const updatedNodes = data.nodes.map(n =>
      n.id === node.id
        ? { ...n, type: newType as any }
        : n
    );
    const newData = {
      ...data,
      nodes: updatedNodes,
      metadata: { ...data.metadata, updatedAt: new Date() }
    };
    onChange(newData);
  }, [data, onChange]);

  const handleSelectAll = useCallback(() => {
    // This would need to be implemented at the parent level
    // For now, just select the first node if any exist
    if (data.nodes.length > 0) {
      onNodeSelect(data.nodes[0]);
    }
  }, [data.nodes, onNodeSelect]);

  const handleClearSelection = useCallback(() => {
    // Clear node and edge selections by selecting null
    onNodeSelect(null as any);
    onEdgeSelect(null as any);
  }, [onNodeSelect, onEdgeSelect]);

  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, 5)); // Max zoom 500%
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(prevZoom / 1.2, 0.1)); // Min zoom 10%
  }, []);

  const handleFitToView = useCallback(() => {
    if (containerRef.current && data.nodes.length > 0) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Calculate bounds of all nodes
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      data.nodes.forEach(node => {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + node.size.width);
        maxY = Math.max(maxY, node.position.y + node.size.height);
      });

      const diagramWidth = maxX - minX;
      const diagramHeight = maxY - minY;

      if (diagramWidth > 0 && diagramHeight > 0) {
        const scaleX = (containerWidth * 0.8) / diagramWidth;
        const scaleY = (containerHeight * 0.8) / diagramHeight;
        const newZoom = Math.min(scaleX, scaleY, 1);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        setZoom(newZoom);
        setPanOffset({
          x: containerWidth / 2 - centerX * newZoom,
          y: containerHeight / 2 - centerY * newZoom
        });
      }
    }
  }, [data.nodes]);

  const handleExportDiagram = useCallback(() => {
    // Use the export utilities to export as JSON
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `diagram-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [data]);

  const handleAddNode = useCallback((position?: Position) => {
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      type: 'rectangle',
      position: position || {
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
  }, [data, onChange, theme]);

  // Keyboard shortcuts
  const keyboardShortcuts = createDiagramShortcuts({
    delete: () => {
      if (selectedNode) {
        handleDeleteNode(selectedNode);
      } else if (selectedEdge) {
        handleDeleteEdge(selectedEdge);
      }
    },
    addNode: () => handleAddNode(),
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

  const handleShowProperties = useCallback((target: DiagramNode | DiagramEdge) => {
    if ('type' in target) {
      // Node properties
      const node = target as DiagramNode;
      const newLabel = prompt('Enter new label:', node.data.label || '');
      if (newLabel !== null && newLabel !== node.data.label) {
        const updatedNodes = data.nodes.map(n =>
          n.id === node.id
            ? { ...n, data: { ...n.data, label: newLabel } }
            : n
        );
        const newData = {
          ...data,
          nodes: updatedNodes,
          metadata: { ...data.metadata, updatedAt: new Date() }
        };
        onChange(newData);
      }
    } else {
      // Edge properties
      const edge = target as DiagramEdge;
      const newLabel = prompt('Enter new label:', edge.data.label || '');
      if (newLabel !== null && newLabel !== edge.data.label) {
        const updatedEdges = data.edges.map(e =>
          e.id === edge.id
            ? { ...e, data: { ...e.data, label: newLabel } }
            : e
        );
        const newData = {
          ...data,
          edges: updatedEdges,
          metadata: { ...data.metadata, updatedAt: new Date() }
        };
        onChange(newData);
      }
    }
  }, [data, onChange]);

  const handleEdgeContextMenu = useCallback((edge: DiagramEdge, event: React.MouseEvent) => {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();

    const menuItems = createDiagramContextMenu({
      delete: () => handleDeleteEdge(edge),
      properties: () => handleShowProperties(edge)
    }, edge);

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      items: menuItems,
      target: edge
    });
  }, [editable, handleDeleteEdge, handleShowProperties]);

  const handleCanvasClick = useCallback(() => {
    // Clear selections when clicking on empty canvas
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  }, [contextMenu]);

  const handleCanvasContextMenu = useCallback((event: React.MouseEvent) => {
    if (!editable || !containerRef.current) return;
    event.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const menuItems = createDiagramContextMenu({
      addNode: () => handleAddNode(position),
      paste: () => handlePasteNode(position),
      selectAll: handleSelectAll,
      clearSelection: handleClearSelection,
      zoomIn: handleZoomIn,
      zoomOut: handleZoomOut,
      fitToView: handleFitToView,
      export: handleExportDiagram
    });

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      items: menuItems,
      target: null
    });
  }, [editable, handleAddNode, handlePasteNode, handleSelectAll, handleClearSelection, handleZoomIn, handleZoomOut, handleFitToView, handleExportDiagram]);

  const handleNodeMouseDown = useCallback((node: DiagramNode, event: React.MouseEvent) => {
    if (!editable || !containerRef.current) return;

    event.stopPropagation();

    // Handle right click for context menu
    if (event.button === 2) {
      event.preventDefault();
      const menuItems = createDiagramContextMenu({
        addNode: () => handleAddNode(),
        delete: () => handleDeleteNode(node),
        copy: () => handleCopyNode(node),
        duplicate: () => handleDuplicateNode(node),
        bringToFront: () => handleBringToFront(node),
        sendToBack: () => handleSendToBack(node),
        changeType: (type) => handleChangeNodeType(node, type),
        properties: () => handleShowProperties(node)
      }, node);

      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        items: menuItems,
        target: node
      });
      return;
    }

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
  }, [editable, handleAddNode, handleDeleteNode, handleCopyNode, handleDuplicateNode, handleBringToFront, handleSendToBack, handleChangeNodeType]);

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
      onContextMenu={handleCanvasContextMenu}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onClick={handleCanvasClick}
        className={draggingNode ? 'diagram-svg-grabbing' : 'diagram-svg-default'}
        style={{
          cursor: isPanning ? 'grabbing' : 'default'
        }}
      >
        <g
          transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}
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
          onEdgeContextMenu={handleEdgeContextMenu}
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
        </g>
      </svg>

      {/* Instructions overlay */}
      {editable && data.nodes.length === 0 && (
        <div className="diagram-overlay">
          <div className="diagram-overlay-icon">📊</div>
          <div className="diagram-overlay-title">Interactive Diagram Canvas</div>
          <div className="diagram-overlay-text">Click "Add Node" to get started</div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
          target={contextMenu.target}
        />
      )}
    </div>
  );
};
