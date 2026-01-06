import { useMemo } from 'react';
import { DiagramNode } from '../types/diagram';

interface UseNodesOptions {
  nodes: DiagramNode[];
  selectedIds?: string[];
}

interface UseNodesReturn {
  all: DiagramNode[];
  selected: DiagramNode[];
  unselected: DiagramNode[];
  count: number;
  selectedCount: number;
  unselectedCount: number;

  // Utility methods
  getById: (id: string) => DiagramNode | undefined;
  getByIds: (ids: string[]) => DiagramNode[];
  isSelected: (node: DiagramNode) => boolean;
  isSelectedId: (id: string) => boolean;

  // Filtering methods
  byType: (type: string) => DiagramNode[];
  byLabel: (label: string) => DiagramNode[];
  byPosition: (x: number, y: number, radius?: number) => DiagramNode[];

  // Statistics
  types: string[];
  typeCounts: Record<string, number>;
}

export const useNodes = (options: UseNodesOptions): UseNodesReturn => {
  const { nodes, selectedIds = [] } = options;

  return useMemo(() => {
    const selected = nodes.filter(node => selectedIds.includes(node.id));
    const unselected = nodes.filter(node => !selectedIds.includes(node.id));

    const getById = (id: string) => nodes.find(node => node.id === id);
    const getByIds = (ids: string[]) => nodes.filter(node => ids.includes(node.id));
    const isSelected = (node: DiagramNode) => selectedIds.includes(node.id);
    const isSelectedId = (id: string) => selectedIds.includes(id);

    const byType = (type: string) => nodes.filter(node => node.type === type);
    const byLabel = (label: string) => nodes.filter(node =>
      node.data.label?.toLowerCase().includes(label.toLowerCase())
    );

    const byPosition = (x: number, y: number, radius = 50) =>
      nodes.filter(node => {
        const centerX = node.position.x + node.size.width / 2;
        const centerY = node.position.y + node.size.height / 2;
        const distance = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
        return distance <= radius;
      });

    const types = Array.from(new Set(nodes.map(node => node.type)));
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = nodes.filter(node => node.type === type).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      all: nodes,
      selected,
      unselected,
      count: nodes.length,
      selectedCount: selected.length,
      unselectedCount: unselected.length,

      getById,
      getByIds,
      isSelected,
      isSelectedId,

      byType,
      byLabel,
      byPosition,

      types,
      typeCounts
    };
  }, [nodes, selectedIds]);
};
