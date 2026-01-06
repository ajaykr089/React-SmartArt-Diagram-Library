// Main components
export { SmartDiagram } from './components/SmartDiagram';
export { SVGRenderer } from './components/renderers/SVGRenderer';

// Types
export type {
  SmartDiagramData,
  DiagramNode,
  DiagramEdge,
  Position,
  Size,
  NodeStyle,
  EdgeStyle,
  LayoutConfig,
  DiagramTheme,
  ExportOptions,
  ImportOptions,
  DiagramEvent,
  KeyboardShortcut,
  DiagramType,
  NodeType,
  EdgeType,
  LayoutDirection
} from './types/diagram';

// Default theme
export { defaultTheme } from './themes/default';
