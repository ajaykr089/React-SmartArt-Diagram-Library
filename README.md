# React SmartArt Diagram Library

**Open-Source SmartArt for Modern Web Apps**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/react-smartart-diagram-library.svg)](https://www.npmjs.com/package/react-smartart-diagram-library)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ajaykr089/React-SmartArt-Diagram-Library/ci.yml)](https://github.com/ajaykr089/React-SmartArt-Diagram-Library/actions)

**Enterprise-grade diagramming solution** for React applications. Create professional diagrams with drag-and-drop editing, auto-layout algorithms, themes, keyboard shortcuts, and export capabilities. Built for corporate dashboards, LMS, AI tools, and modern web applications.

## ✨ Features

### 🎨 **Diagram Types & Visualization**
- **12 Node Shapes**: Rectangle, Circle, Diamond, Triangle, Hexagon, Pentagon, Star, Rounded Rectangle, Ellipse, Parallelogram, Trapezoid, Custom shapes
- **Multiple Diagram Types**: Flowcharts, Org Charts, Mind Maps, Tree Structures, Hierarchy Charts, Process Diagrams
- **3 Rendering Engines**: SVG (default), Canvas, Virtual (for large diagrams)
- **High-DPI Support**: Crisp rendering on all devices

### 🔧 **Advanced Editing & Interaction**
- **Node Operations**: Add, Remove, Resize, Drag & Drop, Shape changing, Text editing
- **Edge Management**: Connect nodes, Edit labels, Custom styling, Arrowheads
- **Context Menus**: Right-click context menus with submenus
- **Keyboard Shortcuts**: Full keyboard navigation (Ctrl+Z/Y, Delete, Ctrl+N, etc.)
- **Undo/Redo System**: Complete history management with customizable depth

### 🎯 **Smart Layout & Auto-Organization**
- **5 Layout Algorithms**: Force-directed, Circular, Tree, Grid, Organic layouts
- **Auto-layout System**: Intelligent diagram organization with debouncing
- **Layout Engines**: Dagre, ELK.js, and Custom physics-based layouts
- **Responsive Layouts**: Horizontal/vertical orientations with spacing controls

### 🎭 **Theming & Customization**
- **3 Built-in Themes**: Light, Dark, Corporate
- **Theme System**: CSS custom properties with localStorage persistence
- **Custom Styling**: Node/edge colors, borders, fonts, animations
- **Extensible Architecture**: Plugin system for custom themes

### 📤 **Import/Export & Data Management**
- **Multi-format Export**: JSON, XML, CSV formats
- **Import Support**: JSON, XML, CSV with validation and error handling
- **File Downloads**: Browser-native file download utilities
- **Data Validation**: Comprehensive error checking and warnings

### 🎣 **Advanced React Hooks**
- **`useDiagram`**: Complete diagram state management
- **`useNodes`**: Node filtering, selection, statistics
- **`useEdges`**: Edge analysis, connectivity, relationships
- **`useAutoLayout`**: Intelligent layout management
- **`useKeyboard`**: Shortcut handling with SSR support

### ⚡ **Performance & Optimization**
- **Virtual Rendering**: Handle thousands of nodes efficiently
- **Debounced Operations**: Optimized for smooth interactions
- **Memory Management**: Proper cleanup and resource management
- **SSR Compatible**: Server-side rendering support

### 📱 **Responsive & Accessible**
- **Mobile Optimized**: Touch gestures and responsive design
- **Keyboard Accessible**: Full keyboard navigation support
- **Screen Reader Support**: ARIA attributes and semantic markup
- **Cross-browser**: Modern browser compatibility

## 🚀 Quick Start

### Installation

```bash
npm install react-smartart-diagram-library
# or
yarn add react-smartart-diagram-library
```

### Basic Usage

```tsx
import React, { useState } from 'react';
import { SmartDiagram, SmartDiagramData } from 'react-smartart-diagram-library';

const MyDiagram = () => {
  const [diagramData, setDiagramData] = useState<SmartDiagramData>({
    nodes: [
      {
        id: 'node-1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        size: { width: 120, height: 60 },
        data: { label: 'Start' }
      }
    ],
    edges: [],
    layout: { type: 'flowchart', direction: 'horizontal' },
    metadata: { title: 'My Diagram' }
  });

  return (
    <SmartDiagram
      data={diagramData}
      editable={true}
      onChange={setDiagramData}
      width={800}
      height={600}
    />
  );
};

export default MyDiagram;
```

### Advanced Usage with Hooks

```tsx
import React from 'react';
import {
  SmartDiagram,
  useDiagram,
  useAutoLayout,
  useKeyboard,
  createDiagramShortcuts
} from 'react-smartart-diagram-library';

const AdvancedDiagram = () => {
  // Complete diagram state management
  const diagram = useDiagram({
    initialData: {
      nodes: [],
      edges: [],
      layout: { type: 'flowchart', direction: 'horizontal' },
      metadata: { title: 'Advanced Diagram' }
    }
  });

  // Auto-layout management
  const { data, triggerLayout } = useAutoLayout(diagram.data, {
    triggerOnNodeAdd: true,
    triggerOnNodeRemove: true,
    debounceMs: 300
  });

  // Keyboard shortcuts
  useKeyboard(createDiagramShortcuts({
    onUndo: diagram.undo,
    onRedo: diagram.redo,
    onDelete: () => {
      if (diagram.selectedNode) diagram.removeNode(diagram.selectedNode.id);
    },
    onNewNode: () => {
      const id = diagram.addNode({
        type: 'rectangle',
        position: { x: Math.random() * 400, y: Math.random() * 300 },
        size: { width: 120, height: 60 },
        data: { label: 'New Node' }
      });
    }
  }));

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => diagram.undo()} disabled={!diagram.canUndo}>
          Undo
        </button>
        <button onClick={() => diagram.redo()} disabled={!diagram.canRedo}>
          Redo
        </button>
        <button onClick={() => triggerLayout('node-add')}>
          Auto Layout
        </button>
      </div>

      <SmartDiagram
        data={data}
        editable={true}
        onChange={diagram.updateData}
        onNodeSelect={diagram.selectNode}
        width={800}
        height={600}
      />
    </div>
  );
};
```

### Using Different Renderers

```tsx
import { CanvasRenderer, VirtualRenderer } from 'react-smartart-diagram-library';

// For high-performance diagrams
<CanvasRenderer
  data={diagramData}
  width={800}
  height={600}
  onNodeClick={(node) => console.log('Clicked:', node)}
/>

// For large diagrams with virtual scrolling
<VirtualRenderer
  data={largeDiagramData}
  width={1200}
  height={800}
  viewport={{ x: 0, y: 0, zoom: 1 }}
  onViewportChange={(viewport) => console.log('Viewport:', viewport)}
/>
```

### Theming and Styling

```tsx
import { ThemeProvider, useTheme, corporateTheme } from 'react-smartart-diagram-library';

const ThemedDiagram = () => {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeProvider theme={corporateTheme}>
      <div>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="corporate">Corporate</option>
        </select>

        <SmartDiagram
          data={diagramData}
          editable={true}
          onChange={setDiagramData}
          width={800}
          height={600}
        />
      </div>
    </ThemeProvider>
  );
};
```

### Export and Import

```tsx
import { exportDiagram, importDiagram, downloadFile } from 'react-smartart-diagram-library';

const handleExport = () => {
  const result = exportDiagram(diagramData, { format: 'json' });
  downloadFile(result);
};

const handleImport = async (file: File) => {
  const text = await file.text();
  const result = importDiagram(text, 'json');

  if (result.errors.length > 0) {
    console.error('Import errors:', result.errors);
  }

  if (result.warnings.length > 0) {
    console.warn('Import warnings:', result.warnings);
  }

  setDiagramData(result.data);
};
```

## 📚 Documentation

### Component Props

```typescript
interface SmartDiagramProps {
  data: SmartDiagramData;           // Diagram data structure
  width?: number;                   // Canvas width (default: 800)
  height?: number;                  // Canvas height (default: 600)
  editable?: boolean;               // Enable editing (default: true)
  zoom?: number;                    // Initial zoom level (default: 1)
  offset?: Position;                // Initial offset (default: {x:0,y:0})
  onChange?: (data: SmartDiagramData) => void;  // Change callback
  onNodeSelect?: (node: DiagramNode) => void;   // Node selection callback
  onEdgeSelect?: (edge: DiagramEdge) => void;   // Edge selection callback
  onCanvasClick?: () => void;        // Canvas click callback
  className?: string;                // Additional CSS classes
}
```

### Data Structure

```typescript
interface SmartDiagramData {
  id?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  layout: LayoutConfig;
  metadata: DiagramMetadata;
  viewport?: ViewportConfig;
}

interface DiagramNode {
  id: string;
  type: NodeType;  // 'rectangle' | 'circle' | 'diamond' | etc.
  position: Position;
  size: Size;
  data: {
    label: string;
    description?: string;
    icon?: string;
    style?: NodeStyle;
  };
  children?: string[];
  locked?: boolean;
}

interface DiagramEdge {
  id: string;
  source: string;  // Source node ID
  target: string;  // Target node ID
  type: EdgeType;  // 'straight' | 'curved' | 'orthogonal'
  data: {
    label?: string;
    style?: EdgeStyle;
  };
}
```

## 🎯 Use Cases

- **Corporate Dashboards**: Create interactive organizational charts and process flows
- **Learning Management Systems**: Build course flow diagrams and knowledge maps
- **AI Productivity Tools**: Visualize AI workflows and decision trees
- **Project Management**: Design project timelines and dependency graphs
- **Business Intelligence**: Create data flow and ETL pipeline visualizations
- **Presentation Tools**: Build engaging diagrams for reports and presentations
- **Whiteboard Applications**: Collaborative diagramming tools

## 🛠️ Development

### Prerequisites

- Node.js 16+ (Node.js 18+ recommended)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/ajaykr089/React-SmartArt-Diagram-Library.git
cd React-SmartArt-Diagram-Library

# Install dependencies
npm install

# Start development server
npm run dev

# Build the library
npm run build

# Run tests
npm test

# Start Storybook
npm run storybook
```

### Project Structure

```
React-SmartArt-Diagram-Library/
├── src/
│   ├── lib/                          # Core library code
│   │   ├── components/
│   │   │   ├── SmartDiagram/         # Main diagram components
│   │   │   │   ├── SmartDiagram.tsx  # Main diagram component
│   │   │   │   ├── DiagramCanvas.tsx # Canvas rendering
│   │   │   │   ├── NodeRenderer.tsx  # Node rendering logic
│   │   │   │   ├── EdgeRenderer.tsx  # Edge rendering logic
│   │   │   │   └── Toolbar.tsx       # Diagram toolbar
│   │   │   ├── nodes/                # Node shape components
│   │   │   │   ├── BaseNode.tsx      # Base node component
│   │   │   │   ├── RectangleNode.tsx # Rectangle shape
│   │   │   │   ├── CircleNode.tsx    # Circle shape
│   │   │   │   ├── DiamondNode.tsx   # Diamond shape
│   │   │   │   └── ... (10+ more shapes)
│   │   │   ├── renderers/            # Rendering engines
│   │   │   │   ├── SVGRenderer.tsx   # SVG rendering (default)
│   │   │   │   ├── CanvasRenderer.tsx # Canvas rendering
│   │   │   │   └── VirtualRenderer.tsx # Virtual scrolling
│   │   │   └── controls/             # Interactive controls
│   │   │       ├── DragHandle.tsx    # Drag functionality
│   │   │       ├── ResizeHandle.tsx  # Resize functionality
│   │   │       └── ContextMenu.tsx   # Context menus
│   │   ├── layouts/                  # Layout system
│   │   │   ├── engines/              # Layout algorithms
│   │   │   │   ├── dagre.ts         # Dagre layout engine
│   │   │   │   ├── elkjs.ts         # ELK.js layout engine
│   │   │   │   └── custom.ts        # Custom physics layouts
│   │   │   ├── LayoutManager.ts     # Layout coordination
│   │   │   └── AutoLayout.ts        # Auto-layout system
│   │   ├── themes/                  # Theming system
│   │   │   ├── default.ts           # Light theme
│   │   │   ├── dark.ts              # Dark theme
│   │   │   ├── corporate.ts         # Corporate theme
│   │   │   └── ThemeProvider.tsx    # Theme context
│   │   ├── hooks/                   # React hooks
│   │   │   ├── useDiagram.ts        # Diagram state management
│   │   │   ├── useNodes.ts          # Node operations
│   │   │   ├── useEdges.ts          # Edge operations
│   │   │   ├── useUndoRedo.ts       # History management
│   │   │   ├── useKeyboard.ts       # Keyboard shortcuts
│   │   │   └── useAutoLayout.ts     # Auto-layout hook
│   │   ├── utils/                   # Utility functions
│   │   │   ├── geometry.ts          # Geometric calculations
│   │   │   ├── animations.ts        # Animation utilities
│   │   │   ├── performance.ts       # Performance optimizations
│   │   │   ├── export.ts            # Export utilities
│   │   │   └── import.ts            # Import utilities
│   │   ├── types/                   # TypeScript definitions
│   │   │   └── diagram.ts           # Core type definitions
│   │   └── index.ts                 # Library exports
│   └── pages/                       # Next.js pages
│       ├── _app.js                  # App wrapper
│       └── index.tsx                # Demo page
├── styles/                          # Global styles
│   └── diagram.css                  # Diagram-specific styles
├── examples/                        # Example implementations
├── docs/                            # Documentation
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── next.config.js                   # Next.js configuration
└── README.md                        # This file
```

### Available Hooks

```typescript
// Complete diagram state management
const diagram = useDiagram({
  initialData: myDiagramData,
  maxHistorySize: 50
});

// Node operations and filtering
const nodes = useNodes({
  nodes: diagram.nodes,
  selectedIds: selectedNodeIds
});

// Edge analysis and relationships
const edges = useEdges({
  edges: diagram.edges,
  nodes: diagram.nodes
});

// Auto-layout with debouncing
const { data, triggerLayout } = useAutoLayout(diagramData, {
  triggerOnNodeAdd: true,
  debounceMs: 300
});

// Keyboard shortcuts
useKeyboard(createDiagramShortcuts({
  onUndo: diagram.undo,
  onRedo: diagram.redo,
  onDelete: () => diagram.removeNode(selectedNode.id)
}));
```

### Available Components

```tsx
// Main diagram component
<SmartDiagram data={data} editable={true} onChange={setData} />

// Alternative renderers
<CanvasRenderer data={data} width={800} height={600} />
<VirtualRenderer data={largeData} width={1200} height={800} />

// Theming
<ThemeProvider theme={darkTheme}>
  <SmartDiagram data={data} />
</ThemeProvider>

// Controls
<DragHandle node={selectedNode} onDrag={handleDrag} />
<ResizeHandle node={selectedNode} onResize={handleResize} />
<ContextMenu x={x} y={y} items={menuItems} onClose={closeMenu} />
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines

- Follow TypeScript strict mode
- Write comprehensive tests
- Follow conventional commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Microsoft PowerPoint SmartArt
- Built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [D3](https://d3js.org/)
- Layout algorithms powered by [Dagre](https://github.com/dagrejs/dagre) and [ELK](https://www.eclipse.org/elk/)

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/ajaykr089/React-SmartArt-Diagram-Library/issues)

---

**Made with ❤️ for the React community**
