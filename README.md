# React SmartArt Diagram Library

**Open-Source SmartArt for Modern Web Apps**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful, open-source React component library for creating and editing professional diagram structures similar to Microsoft PowerPoint SmartArt. Built with TypeScript, SVG rendering, and modern React patterns.

## ✨ Features

- **🎨 Multiple Diagram Types**: Flowcharts, org charts, mind maps, tree structures, hierarchy charts, and more
- **🔧 Node Editing**: Add, remove, resize, and customize nodes with different shapes (rectangle, circle, diamond, etc.)
- **🎯 Drag & Drop**: Intuitive drag-and-drop functionality for nodes and edges
- **📐 Auto Layout**: Intelligent layout algorithms with Dagre and ElkJS integration
- **🎭 Themes & Styles**: Customizable themes and styling options
- **⌨️ Keyboard Shortcuts**: Full keyboard navigation and shortcuts
- **🔄 Undo/Redo**: Complete history management
- **📤 Export Options**: Export to PNG, SVG, and JSON formats
- **📥 Import Support**: Import diagrams from JSON
- **📱 Responsive**: Mobile and desktop optimized
- **⚡ Performance**: Virtual rendering for large diagrams
- **🔒 TypeScript**: Full TypeScript support with comprehensive type definitions

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
├── src/lib/
│   ├── components/
│   │   ├── SmartDiagram.tsx      # Main diagram component
│   │   └── renderers/
│   │       └── SVGRenderer.tsx   # SVG rendering engine
│   ├── layouts/
│   │   ├── engines/
│   │   │   ├── dagre.ts         # Dagre layout engine
│   │   │   └── elkjs.ts         # ELK layout engine
│   │   └── LayoutManager.ts     # Layout management
│   ├── themes/
│   │   └── default.ts           # Default theme
│   ├── types/
│   │   └── diagram.ts           # TypeScript definitions
│   └── index.ts                 # Library exports
├── examples/                    # Example implementations
├── docs/                        # Documentation
└── package.json
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
