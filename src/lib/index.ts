// Main components
export { SmartDiagram } from './components/SmartDiagram';
export { SVGRenderer } from './components/renderers/SVGRenderer';
export { CanvasRenderer, CanvasRendererComponent } from './renderers/CanvasRenderer';
export { VirtualRenderer } from './renderers/VirtualRenderer';

// Control components
export { DragHandle } from './components/controls/DragHandle';
export { ResizeHandle, NodeResizeHandles } from './components/controls/ResizeHandle';
export { ContextMenu, createDiagramContextMenu } from './components/controls/ContextMenu';

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
  DiagramEvent,
  KeyboardShortcut,
  DiagramType,
  NodeType,
  EdgeType,
  LayoutDirection
} from './types/diagram';

// Utility classes
export { GeometryUtils } from './utils/geometry';
export { AnimationUtils } from './utils/animations';
export { PerformanceUtils } from './utils/performance';
export { ExportUtils } from './utils/exportUtils';

// Import/Export utilities
export { exportDiagram, exportToJSON, exportToXML, exportToCSV, downloadFile, formatFileSize } from './utils/export';
export type { ExportOptions, ExportResult } from './utils/export';
export { importDiagram, importFromJSON, importFromXML, importFromCSV } from './utils/import';
export type { ImportOptions, ImportResult } from './utils/import';

// Layout engines and systems
export { applyCustomLayout, CustomLayoutEngine } from './layouts/engines/custom';
export { LayoutManager, layoutManager } from './layouts/LayoutManager';
export type { LayoutEngineType } from './layouts/LayoutManager';
export { AutoLayoutManager, createFlowchartAutoLayout, createOrgChartAutoLayout, createMindMapAutoLayout, useAutoLayout } from './layouts/AutoLayout';
export type { AutoLayoutOptions } from './layouts/AutoLayout';

// Hooks
export { useUndoRedo } from './hooks/useUndoRedo';
export { useKeyboard, createDiagramShortcuts, KeyboardShortcutsHelp } from './hooks/useKeyboard';
export { useDiagram } from './hooks/useDiagram';
export { useNodes } from './hooks/useNodes';
export { useEdges } from './hooks/useEdges';

// Themes and theming
export { defaultTheme } from './themes/default';
export { darkTheme } from './themes/dark';
export { corporateTheme } from './themes/corporate';
export { ThemeProvider, useTheme, ThemeSelector } from './themes/ThemeProvider';
