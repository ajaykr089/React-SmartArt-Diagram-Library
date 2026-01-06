import { SmartDiagramData, DiagramNode, DiagramEdge } from '../types/diagram';

export interface ImportOptions {
  validateData?: boolean;
  defaultNodeSize?: { width: number; height: number };
  defaultEdgeStyle?: any;
}

export interface ImportResult {
  data: SmartDiagramData;
  errors: string[];
  warnings: string[];
}

// Import from JSON format
export const importFromJSON = (
  jsonString: string,
  options: ImportOptions = {}
): ImportResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      errors.push('Invalid JSON format');
      return { data: createEmptyDiagram(), errors, warnings };
    }

    // Validate and normalize the data
    const data: SmartDiagramData = {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes.map(normalizeNode) : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges.map(normalizeEdge) : [],
      layout: normalizeLayout(parsed.layout),
      metadata: normalizeMetadata(parsed.metadata)
    };

    // Additional validation if requested
    if (options.validateData) {
      validateDiagramData(data, errors, warnings);
    }

    return { data, errors, warnings };
  } catch (error) {
    errors.push(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { data: createEmptyDiagram(), errors, warnings };
  }
};

// Import from XML format
export const importFromXML = (
  xmlString: string,
  options: ImportOptions = {}
): ImportResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      errors.push('Invalid XML format');
      return { data: createEmptyDiagram(), errors, warnings };
    }

    const data = parseXMLToDiagram(xmlDoc, options, errors, warnings);

    if (options.validateData) {
      validateDiagramData(data, errors, warnings);
    }

    return { data, errors, warnings };
  } catch (error) {
    errors.push(`XML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { data: createEmptyDiagram(), errors, warnings };
  }
};

// Import from CSV format
export const importFromCSV = (
  csvString: string,
  options: ImportOptions = {}
): ImportResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const lines = csvString.trim().split('\n');
    if (lines.length === 0) {
      errors.push('Empty CSV data');
      return { data: createEmptyDiagram(), errors, warnings };
    }

    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const columns = parseCSVLine(trimmed);

      if (columns.length >= 1 && columns[0] === 'Type') {
        currentSection = columns[1] || '';
        continue;
      }

      if (currentSection === 'node' && columns.length >= 6) {
        try {
      const label = columns[2] ? columns[2].replace(/^"|"$/g, '') : 'Node';
      const node: DiagramNode = {
        id: columns[1] || `node-${nodes.length}`,
        type: (columns[0] as any) || 'rectangle',
        position: {
          x: parseFloat(columns[3]) || 0,
          y: parseFloat(columns[4]) || 0
        },
        size: {
          width: parseFloat(columns[5]) || 120,
          height: parseFloat(columns[6]) || 60
        },
        data: {
          label,
          style: {}
        }
      };
          nodes.push(node);
        } catch (error) {
          warnings.push(`Failed to parse node: ${line}`);
        }
      } else if (currentSection === 'edge' && columns.length >= 4) {
        try {
          const edge: DiagramEdge = {
            id: columns[1],
            source: columns[2],
            target: columns[3],
            type: 'straight',
            data: {
              label: columns[4] ? columns[4].replace(/^"|"$/g, '') : undefined,
              style: {}
            }
          };
          edges.push(edge);
        } catch (error) {
          warnings.push(`Failed to parse edge: ${line}`);
        }
      }
    }

    const data: SmartDiagramData = {
      nodes,
      edges,
      layout: {
        type: 'flowchart',
        direction: 'horizontal',
        spacing: { horizontal: 50, vertical: 50, node: 20 }
      },
      metadata: {
        title: 'Imported from CSV',
        description: 'Diagram imported from CSV format',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'CSV Import'
      }
    };

    if (options.validateData) {
      validateDiagramData(data, errors, warnings);
    }

    return { data, errors, warnings };
  } catch (error) {
    errors.push(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { data: createEmptyDiagram(), errors, warnings };
  }
};

// Generic import function
export const importDiagram = (
  data: string,
  format: 'json' | 'xml' | 'csv' = 'json',
  options: ImportOptions = {}
): ImportResult => {
  switch (format) {
    case 'xml':
      return importFromXML(data, options);
    case 'csv':
      return importFromCSV(data, options);
    case 'json':
    default:
      return importFromJSON(data, options);
  }
};

// Helper functions
function createEmptyDiagram(): SmartDiagramData {
  return {
    nodes: [],
    edges: [],
    layout: {
      type: 'flowchart',
      direction: 'horizontal',
      spacing: { horizontal: 50, vertical: 50, node: 20 }
    },
    metadata: {
      title: 'Empty Diagram',
      description: 'No data imported',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'Import Utility'
    }
  };
}

function normalizeNode(node: any): DiagramNode {
  return {
    id: node.id || `node-${Date.now()}`,
    type: node.type || 'rectangle',
    position: {
      x: parseFloat(node.position?.x || node.x || 0),
      y: parseFloat(node.position?.y || node.y || 0)
    },
    size: {
      width: parseFloat(node.size?.width || node.width || 120),
      height: parseFloat(node.size?.height || node.height || 60)
    },
    data: {
      label: node.data?.label || node.label || undefined,
      style: node.data?.style || node.style || {}
    }
  };
}

function normalizeEdge(edge: any): DiagramEdge {
  return {
    id: edge.id || `edge-${Date.now()}`,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'straight',
    data: {
      label: edge.data?.label || edge.label || undefined,
      style: edge.data?.style || edge.style || {}
    }
  };
}

function normalizeLayout(layout: any) {
  return {
    type: layout?.type || 'flowchart',
    direction: layout?.direction || 'horizontal',
    spacing: layout?.spacing || { horizontal: 50, vertical: 50, node: 20 }
  };
}

function normalizeMetadata(metadata: any) {
  return {
    title: metadata?.title || 'Imported Diagram',
    description: metadata?.description || 'Diagram imported from external format',
    version: metadata?.version || '1.0.0',
    createdAt: metadata?.createdAt ? new Date(metadata.createdAt) : new Date(),
    updatedAt: metadata?.updatedAt ? new Date(metadata.updatedAt) : new Date(),
    author: metadata?.author || 'Import Utility',
    ...metadata
  };
}

function parseXMLToDiagram(
  xmlDoc: Document,
  options: ImportOptions,
  errors: string[],
  warnings: string[]
): SmartDiagramData {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  // Parse nodes
  const nodeElements = xmlDoc.querySelectorAll('node');
  nodeElements.forEach((nodeEl, index) => {
    try {
      const id = nodeEl.getAttribute('id') || `node-${index}`;
      const type = nodeEl.getAttribute('type') || 'rectangle';
      const x = parseFloat(nodeEl.getAttribute('x') || '0');
      const y = parseFloat(nodeEl.getAttribute('y') || '0');
      const width = parseFloat(nodeEl.getAttribute('width') || '120');
      const height = parseFloat(nodeEl.getAttribute('height') || '60');

      const labelEl = nodeEl.querySelector('label');
      const label = labelEl?.textContent || 'Node';

      nodes.push({
        id,
        type: type as any,
        position: { x, y },
        size: { width, height },
        data: { label, style: {} }
      });
    } catch (error) {
      warnings.push(`Failed to parse node ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Parse edges
  const edgeElements = xmlDoc.querySelectorAll('edge');
  edgeElements.forEach((edgeEl, index) => {
    try {
      const id = edgeEl.getAttribute('id') || `edge-${index}`;
      const source = edgeEl.getAttribute('source') || '';
      const target = edgeEl.getAttribute('target') || '';
      const type = edgeEl.getAttribute('type') || 'straight';

      const labelEl = edgeEl.querySelector('label');
      const label = labelEl?.textContent || undefined;

      edges.push({
        id,
        source,
        target,
        type: type as any,
        data: { label, style: {} }
      });
    } catch (error) {
      warnings.push(`Failed to parse edge ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    nodes,
    edges,
    layout: {
      type: 'flowchart',
      direction: 'horizontal',
      spacing: { horizontal: 50, vertical: 50, node: 20 }
    },
    metadata: {
      title: 'Imported from XML',
      description: 'Diagram imported from XML format',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'XML Import'
    }
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function validateDiagramData(data: SmartDiagramData, errors: string[], warnings: string[]) {
  // Check for duplicate IDs
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  data.nodes.forEach(node => {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID: ${node.id}`);
    }
    nodeIds.add(node.id);
  });

  data.edges.forEach(edge => {
    if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate edge ID: ${edge.id}`);
    }
    edgeIds.add(edge.id);

    // Check if source and target nodes exist
    if (!nodeIds.has(edge.source)) {
      warnings.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      warnings.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
    }
  });

  // Check for orphaned nodes
  if (data.edges.length === 0 && data.nodes.length > 1) {
    warnings.push('Diagram has multiple nodes but no connections');
  }
}
