import { useMemo } from 'react';
import { DiagramEdge, DiagramNode } from '../types/diagram';

interface UseEdgesOptions {
  edges: DiagramEdge[];
  nodes: DiagramNode[];
  selectedIds?: string[];
}

interface UseEdgesReturn {
  all: DiagramEdge[];
  selected: DiagramEdge[];
  unselected: DiagramEdge[];
  count: number;
  selectedCount: number;
  unselectedCount: number;

  // Utility methods
  getById: (id: string) => DiagramEdge | undefined;
  getByIds: (ids: string[]) => DiagramEdge[];
  isSelected: (edge: DiagramEdge) => boolean;
  isSelectedId: (id: string) => boolean;

  // Relationship methods
  getIncoming: (nodeId: string) => DiagramEdge[];
  getOutgoing: (nodeId: string) => DiagramEdge[];
  getConnected: (nodeId: string) => DiagramEdge[];
  getBetween: (sourceId: string, targetId: string) => DiagramEdge[];

  // Filtering methods
  byType: (type: string) => DiagramEdge[];
  byLabel: (label: string) => DiagramEdge[];
  bySource: (sourceId: string) => DiagramEdge[];
  byTarget: (targetId: string) => DiagramEdge[];

  // Analysis methods
  hasCycle: () => boolean;
  getIsolatedNodes: () => string[];
  getConnectivity: () => Record<string, number>;

  // Statistics
  types: string[];
  typeCounts: Record<string, number>;
  directionality: 'directed' | 'undirected' | 'mixed';
}

export const useEdges = (options: UseEdgesOptions): UseEdgesReturn => {
  const { edges, nodes, selectedIds = [] } = options;

  return useMemo(() => {
    const selected = edges.filter(edge => selectedIds.includes(edge.id));
    const unselected = edges.filter(edge => !selectedIds.includes(edge.id));

    const getById = (id: string) => edges.find(edge => edge.id === id);
    const getByIds = (ids: string[]) => edges.filter(edge => ids.includes(edge.id));
    const isSelected = (edge: DiagramEdge) => selectedIds.includes(edge.id);
    const isSelectedId = (id: string) => selectedIds.includes(id);

    const getIncoming = (nodeId: string) =>
      edges.filter(edge => edge.target === nodeId);

    const getOutgoing = (nodeId: string) =>
      edges.filter(edge => edge.source === nodeId);

    const getConnected = (nodeId: string) =>
      edges.filter(edge => edge.source === nodeId || edge.target === nodeId);

    const getBetween = (sourceId: string, targetId: string) =>
      edges.filter(edge =>
        (edge.source === sourceId && edge.target === targetId) ||
        (edge.source === targetId && edge.target === sourceId)
      );

    const byType = (type: string) => edges.filter(edge => edge.type === type);
    const byLabel = (label: string) => edges.filter(edge =>
      edge.data.label?.toLowerCase().includes(label.toLowerCase())
    );
    const bySource = (sourceId: string) => edges.filter(edge => edge.source === sourceId);
    const byTarget = (targetId: string) => edges.filter(edge => edge.target === targetId);

    // Cycle detection using DFS
    const hasCycle = (): boolean => {
      const visited = new Set<string>();
      const recStack = new Set<string>();
      const nodeMap = new Map(nodes.map(node => [node.id, node]));

      const dfs = (nodeId: string): boolean => {
        if (recStack.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visited.add(nodeId);
        recStack.add(nodeId);

        const outgoingEdges = edges.filter(edge => edge.source === nodeId);
        for (const edge of outgoingEdges) {
          if (dfs(edge.target)) return true;
        }

        recStack.delete(nodeId);
        return false;
      };

      for (const node of nodes) {
        if (!visited.has(node.id) && dfs(node.id)) {
          return true;
        }
      }
      return false;
    };

    const getIsolatedNodes = (): string[] => {
      const connectedNodes = new Set<string>();
      edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      });
      return nodes.filter(node => !connectedNodes.has(node.id)).map(node => node.id);
    };

    const getConnectivity = (): Record<string, number> => {
      return nodes.reduce((acc, node) => {
        acc[node.id] = getConnected(node.id).length;
        return acc;
      }, {} as Record<string, number>);
    };

    const types = Array.from(new Set(edges.map(edge => edge.type)));
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = edges.filter(edge => edge.type === type).length;
      return acc;
    }, {} as Record<string, number>);

    // Determine directionality
    const hasDirected = edges.some(edge => edge.source !== edge.target);
    const hasUndirected = edges.some(edge => {
      const reverse = edges.find(e =>
        e.source === edge.target && e.target === edge.source
      );
      return !!reverse;
    });

    let directionality: 'directed' | 'undirected' | 'mixed' = 'directed';
    if (!hasDirected && hasUndirected) {
      directionality = 'undirected';
    } else if (hasDirected && hasUndirected) {
      directionality = 'mixed';
    }

    return {
      all: edges,
      selected,
      unselected,
      count: edges.length,
      selectedCount: selected.length,
      unselectedCount: unselected.length,

      getById,
      getByIds,
      isSelected,
      isSelectedId,

      getIncoming,
      getOutgoing,
      getConnected,
      getBetween,

      byType,
      byLabel,
      bySource,
      byTarget,

      hasCycle,
      getIsolatedNodes,
      getConnectivity,

      types,
      typeCounts,
      directionality
    };
  }, [edges, nodes, selectedIds]);
};
