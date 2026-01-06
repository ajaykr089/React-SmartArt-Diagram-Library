import { useState, useCallback, useRef } from 'react';
import { SmartDiagramData, DiagramNode, DiagramEdge } from '../types/diagram';
import { useUndoRedo } from './useUndoRedo';

interface UseDiagramOptions {
  initialData?: SmartDiagramData;
  maxHistorySize?: number;
}

interface UseDiagramReturn {
  data: SmartDiagramData;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  selectedNode: DiagramNode | null;
  selectedEdge: DiagramEdge | null;

  // Node operations
  addNode: (node: Omit<DiagramNode, 'id'>) => string;
  updateNode: (id: string, updates: Partial<DiagramNode>) => void;
  removeNode: (id: string) => void;
  selectNode: (node: DiagramNode | null) => void;
  getNodeById: (id: string) => DiagramNode | undefined;

  // Edge operations
  addEdge: (edge: Omit<DiagramEdge, 'id'>) => string;
  updateEdge: (id: string, updates: Partial<DiagramEdge>) => void;
  removeEdge: (id: string) => void;
  selectEdge: (edge: DiagramEdge | null) => void;
  getEdgeById: (id: string) => DiagramEdge | undefined;

  // Bulk operations
  updateData: (newData: SmartDiagramData) => void;
  clearDiagram: () => void;

  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newData?: SmartDiagramData) => void;
}

export const useDiagram = (options: UseDiagramOptions = {}): UseDiagramReturn => {
  const {
    initialData,
    maxHistorySize = 50
  } = options;

  const defaultData: SmartDiagramData = {
    nodes: [],
    edges: [],
    layout: {
      type: 'flowchart',
      direction: 'horizontal',
      spacing: { horizontal: 50, vertical: 50, node: 20 }
    },
    metadata: {
      title: 'New Diagram',
      description: 'Start creating your diagram',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'React SmartArt Library'
    }
  };

  const [data, setData] = useState<SmartDiagramData>(initialData || defaultData);
  const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<DiagramEdge | null>(null);

  // Use undo/redo system
  const { currentData, recordChange, undo, redo, canUndo, canRedo, reset } = useUndoRedo(data);

  // Node operations
  const addNode = useCallback((nodeData: Omit<DiagramNode, 'id'>): string => {
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: DiagramNode = { ...nodeData, id };

    const newData = {
      ...data,
      nodes: [...data.nodes, newNode],
      metadata: { ...data.metadata, updatedAt: new Date() }
    };

    setData(newData);
    return id;
  }, [data]);

  const updateNode = useCallback((id: string, updates: Partial<DiagramNode>) => {
    const newData = {
      ...data,
      nodes: data.nodes.map(node =>
        node.id === id ? { ...node, ...updates } : node
      ),
      metadata: { ...data.metadata, updatedAt: new Date() }
    };

    setData(newData);
  }, [data]);

  const removeNode = useCallback((id: string) => {
    const newData = {
      ...data,
      nodes: data.nodes.filter(node => node.id !== id),
      edges: data.edges.filter(edge =>
        edge.source !== id && edge.target !== id
      ),
      metadata: { ...data.metadata, updatedAt: new Date() }
    };

    setData(newData);

    // Clear selection if the removed node was selected
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
  }, [data, selectedNode]);

  const selectNode = useCallback((node: DiagramNode | null) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const getNodeById = useCallback((id: string) => {
    return data.nodes.find(node => node.id === id);
  }, [data.nodes]);

  // Edge operations
  const addEdge = useCallback((edgeData: Omit<DiagramEdge, 'id'>): string => {
    const id = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newEdge: DiagramEdge = { ...edgeData, id };

    const newData = {
      ...data,
      edges: [...data.edges, newEdge],
      metadata: { ...data.metadata, updatedAt: new Date() }
    };

    setData(newData);
    return id;
  }, [data]);

  const updateEdge = useCallback((id: string, updates: Partial<DiagramEdge>) => {
    const newData = {
      ...data,
      edges: data.edges.map(edge =>
        edge.id === id ? { ...edge, ...updates } : edge
      ),
      metadata: { ...data.metadata, updatedAt: new Date() }
    };

    setData(newData);
  }, [data]);

  const removeEdge = useCallback((id: string) => {
    const newData = {
      ...data,
      edges: data.edges.filter(edge => edge.id !== id),
      metadata: { ...data.metadata, updatedAt: new Date() }
    };

    setData(newData);

    // Clear selection if the removed edge was selected
    if (selectedEdge?.id === id) {
      setSelectedEdge(null);
    }
  }, [data, selectedEdge]);

  const selectEdge = useCallback((edge: DiagramEdge | null) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const getEdgeById = useCallback((id: string) => {
    return data.edges.find(edge => edge.id === id);
  }, [data.edges]);

  // Bulk operations
  const updateData = useCallback((newData: SmartDiagramData) => {
    setData(newData);
  }, []);

  const clearDiagram = useCallback(() => {
    const emptyData = {
      ...defaultData,
      metadata: {
        ...defaultData.metadata,
        title: 'New Diagram',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    setData(emptyData);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  return {
    data,
    nodes: data.nodes,
    edges: data.edges,
    selectedNode,
    selectedEdge,

    // Node operations
    addNode,
    updateNode,
    removeNode,
    selectNode,
    getNodeById,

    // Edge operations
    addEdge,
    updateEdge,
    removeEdge,
    selectEdge,
    getEdgeById,

    // Bulk operations
    updateData,
    clearDiagram,

    // History operations
    undo,
    redo,
    canUndo,
    canRedo,
    reset
  };
};
