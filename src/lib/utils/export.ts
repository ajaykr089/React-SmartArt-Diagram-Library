import { SmartDiagramData } from '../types/diagram';

export interface ExportOptions {
  format?: 'json' | 'xml' | 'csv';
  includeMetadata?: boolean;
  includeStyles?: boolean;
  prettyPrint?: boolean;
  fileName?: string;
}

export interface ExportResult {
  data: string;
  mimeType: string;
  fileName: string;
  size: number;
}

// Export to JSON format
export const exportToJSON = (
  data: SmartDiagramData,
  options: ExportOptions = {}
): ExportResult => {
  const {
    includeMetadata = true,
    includeStyles = true,
    prettyPrint = true,
    fileName = 'diagram.json'
  } = options;

  // Clean up data based on options
  const exportData = {
    ...data,
    ...(includeMetadata ? {} : { metadata: undefined }),
    nodes: data.nodes.map(node => ({
      ...node,
      ...(includeStyles ? {} : { data: { ...node.data, style: undefined } })
    })),
    edges: data.edges.map(edge => ({
      ...edge,
      ...(includeStyles ? {} : { data: { ...edge.data, style: undefined } })
    }))
  };

  const jsonString = prettyPrint
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData);

  return {
    data: jsonString,
    mimeType: 'application/json',
    fileName,
    size: jsonString.length
  };
};

// Export to XML format
export const exportToXML = (
  data: SmartDiagramData,
  options: ExportOptions = {}
): ExportResult => {
  const {
    includeMetadata = true,
    includeStyles = true,
    fileName = 'diagram.xml'
  } = options;

  const createXMLElement = (tagName: string, attributes: Record<string, any> = {}, content = '') => {
    const attrs = Object.entries(attributes)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => key + '="' + String(value).replace(/"/g, '"') + '"')
      .join(' ');

    const attrString = attrs ? ' ' + attrs : '';
    return content ? '<' + tagName + attrString + '>' + content + '</' + tagName + '>' : '<' + tagName + attrString + ' />';
  };

  const escapeXML = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  // Build XML structure
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<diagram>\n';

  // Add metadata
  if (includeMetadata && data.metadata) {
    xml += '  <metadata>\n';
    Object.entries(data.metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        xml += `    <${key}>${escapeXML(String(value))}</${key}>\n`;
      }
    });
    xml += '  </metadata>\n';
  }

  // Add layout
  xml += '  <layout>\n';
  Object.entries(data.layout).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      xml += `    <${key}>\n`;
      Object.entries(value).forEach(([subKey, subValue]) => {
        xml += `      <${subKey}>${escapeXML(String(subValue))}</${subKey}>\n`;
      });
      xml += `    </${key}>\n`;
    } else {
      xml += `    <${key}>${escapeXML(String(value))}</${key}>\n`;
    }
  });
  xml += '  </layout>\n';

  // Add nodes
  xml += '  <nodes>\n';
  data.nodes.forEach(node => {
    const nodeAttrs: Record<string, any> = {
      id: node.id,
      type: node.type,
      x: node.position.x,
      y: node.position.y,
      width: node.size.width,
      height: node.size.height
    };

    let nodeContent = '';

    // Add label
    if (node.data.label) {
      nodeContent += createXMLElement('label', {}, escapeXML(node.data.label));
    }

    // Add styles
    if (includeStyles && node.data.style) {
      nodeContent += '<style>\n';
      Object.entries(node.data.style).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          nodeContent += `        <${key}>${escapeXML(String(value))}</${key}>\n`;
        }
      });
      nodeContent += '      </style>\n';
    }

    xml += `    ${createXMLElement('node', nodeAttrs, nodeContent ? `\n      ${nodeContent}    ` : '')}\n`;
  });
  xml += '  </nodes>\n';

  // Add edges
  xml += '  <edges>\n';
  data.edges.forEach(edge => {
    const edgeAttrs: Record<string, any> = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type
    };

    let edgeContent = '';

    // Add label
    if (edge.data.label) {
      edgeContent += createXMLElement('label', {}, escapeXML(edge.data.label));
    }

    // Add styles
    if (includeStyles && edge.data.style) {
      edgeContent += '<style>\n';
      Object.entries(edge.data.style).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          edgeContent += `        <${key}>${escapeXML(String(value))}</${key}>\n`;
        }
      });
      edgeContent += '      </style>\n';
    }

    xml += `    ${createXMLElement('edge', edgeAttrs, edgeContent ? `\n      ${edgeContent}    ` : '')}\n`;
  });
  xml += '  </edges>\n';

  xml += '</diagram>';

  return {
    data: xml,
    mimeType: 'application/xml',
    fileName,
    size: xml.length
  };
};

// Export to CSV format (basic node/edge listing)
export const exportToCSV = (
  data: SmartDiagramData,
  options: ExportOptions = {}
): ExportResult => {
  const { fileName = 'diagram.csv' } = options;

  const csvRows: string[] = [];

  // Add nodes
  csvRows.push('Type,ID,Label,X,Y,Width,Height');
  data.nodes.forEach(node => {
    csvRows.push([
      'node',
      node.id,
      `"${node.data.label || ''}"`,
      node.position.x,
      node.position.y,
      node.size.width,
      node.size.height
    ].join(','));
  });

  // Add edges
  csvRows.push('');
  csvRows.push('Type,ID,Source,Target,Label');
  data.edges.forEach(edge => {
    csvRows.push([
      'edge',
      edge.id,
      edge.source,
      edge.target,
      `"${edge.data.label || ''}"`
    ].join(','));
  });

  const csvData = csvRows.join('\n');

  return {
    data: csvData,
    mimeType: 'text/csv',
    fileName,
    size: csvData.length
  };
};

// Generic export function
export const exportDiagram = (
  data: SmartDiagramData,
  options: ExportOptions = {}
): ExportResult => {
  const { format = 'json' } = options;

  switch (format) {
    case 'xml':
      return exportToXML(data, options);
    case 'csv':
      return exportToCSV(data, options);
    case 'json':
    default:
      return exportToJSON(data, options);
  }
};

// Download file utility
export const downloadFile = (result: ExportResult): void => {
  const blob = new Blob([result.data], { type: result.mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = result.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Get file size in human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
