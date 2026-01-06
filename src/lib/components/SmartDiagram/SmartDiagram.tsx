import React, { useState, useCallback } from 'react';
import { SmartDiagramData, DiagramNode, DiagramEdge } from '../../types/diagram';
import { DiagramCanvas } from './DiagramCanvas';
import { Toolbar } from './Toolbar';

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

  const handleDiagramChange = useCallback((newData: SmartDiagramData) => {
    // Update selectedNode/selectedEdge references if they exist in the new data
    if (selectedNode) {
      const updatedNode = newData.nodes.find(node => node.id === selectedNode.id);
      setSelectedNode(updatedNode || null);
    }

    if (selectedEdge) {
      const updatedEdge = newData.edges.find(edge => edge.id === selectedEdge.id);
      setSelectedEdge(updatedEdge || null);
    }

    onChange?.(newData);
  }, [selectedNode, selectedEdge, onChange]);

  const handleNodeSelect = useCallback((node: DiagramNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const handleEdgeSelect = useCallback((edge: DiagramEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    onEdgeSelect?.(edge);
  }, [onEdgeSelect]);

  const handleAddNode = useCallback(() => {
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      type: 'rectangle',
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50
      },
      size: { width: 120, height: 60 },
      data: {
        label: `Node ${data.nodes.length + 1}`,
        style: {
          backgroundColor: '#10B981',
          textColor: '#FFFFFF'
        }
      }
    };

    const newData = {
      ...data,
      nodes: [...data.nodes, newNode],
      metadata: { ...data.metadata, updatedAt: new Date() }
    };

    handleDiagramChange(newData);
  }, [data, handleDiagramChange]);

  const handleAddEdge = useCallback(() => {
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

    handleDiagramChange(newData);
  }, [data, selectedNode, handleDiagramChange]);

  return (
    <div style={{ width, height, position: 'relative' }}>
      <Toolbar
        onAddNode={handleAddNode}
        onAddEdge={handleAddEdge}
        canAddEdge={!!selectedNode && data.nodes.length >= 2}
      />
      <DiagramCanvas
        data={data}
        width="100%"
        height="500"
        editable={editable}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onChange={handleDiagramChange}
        onNodeSelect={handleNodeSelect}
        onEdgeSelect={handleEdgeSelect}
      />
    </div>
  );
};
