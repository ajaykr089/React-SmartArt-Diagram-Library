export type DiagramType =
  | 'flowchart'
  | 'org-chart'
  | 'mind-map'
  | 'tree'
  | 'hierarchy'
  | 'process-diagram'
  | 'custom';

export type NodeType =
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'triangle'
  | 'hexagon'
  | 'pentagon'
  | 'star'
  | 'rounded-rectangle'
  | 'ellipse'
  | 'parallelogram'
  | 'trapezoid'
  | 'custom';

export type EdgeType =
  | 'straight'
  | 'curved'
  | 'orthogonal'
  | 'bezier';

export type LayoutDirection =
  | 'horizontal'
  | 'vertical'
  | 'top-bottom'
  | 'bottom-top'
  | 'left-right'
  | 'right-left';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  padding?: number;
  shadow?: boolean;
  gradient?: {
    start: string;
    end: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  };
}

export interface EdgeStyle {
  strokeColor?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fillColor?: string;
  arrowhead?: 'none' | 'arrow' | 'circle' | 'diamond';
  animated?: boolean;
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  position: Position;
  size: Size;
  data: {
    label: string;
    description?: string;
    icon?: string;
    style?: NodeStyle;
    metadata?: Record<string, any>;
  };
  children?: string[]; // For hierarchical diagrams
  parent?: string;
  level?: number; // For tree/hierarchy levels
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  data: {
    label?: string;
    style?: EdgeStyle;
    metadata?: Record<string, any>;
  };
  waypoints?: Position[]; // For custom edge paths
  animated?: boolean;
  locked?: boolean;
  visible?: boolean;
}

export interface LayoutConfig {
  type: DiagramType;
  direction: LayoutDirection;
  spacing: {
    horizontal: number;
    vertical: number;
    node: number;
  };
  alignment?: 'start' | 'center' | 'end';
  padding?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface SmartDiagramData {
  id?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  layout: LayoutConfig;
  metadata: {
    title: string;
    description?: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    tags?: string[];
  };
  viewport?: {
    zoom: number;
    offset: Position;
  };
}

export interface DiagramTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
    };
    fontWeight: {
      normal: number;
      bold: number;
    };
  };
  node: {
    default: NodeStyle;
    types: Record<NodeType, NodeStyle>;
  };
  edge: {
    default: EdgeStyle;
    types: Record<EdgeType, EdgeStyle>;
  };
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'json' | 'pdf';
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  includeMetadata?: boolean;
}

export interface ImportOptions {
  format: 'json';
  validate?: boolean;
  merge?: boolean;
}

export interface DiagramEvent {
  type: 'node:add' | 'node:remove' | 'node:update' | 'edge:add' | 'edge:remove' | 'edge:update' | 'layout:change' | 'zoom:change';
  payload: any;
  timestamp: Date;
}

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}
