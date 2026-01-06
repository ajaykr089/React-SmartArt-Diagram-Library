import React, { useState } from 'react';
import Head from 'next/head';
import {
  Container,
  Header,
  Content,
  Footer,
  Grid,
  Row,
  Col,
  Panel,
  Button,
  ButtonGroup,
  Input,
  Badge
} from 'rsuite';
import { SmartDiagram, SmartDiagramData, DiagramNode, DiagramEdge } from '../src/lib';
import { ExportUtils } from '../src/lib/utils/exportUtils';

const sampleData: SmartDiagramData = {
  id: 'sample-diagram',
  nodes: [
    {
      id: 'node-1',
      type: 'rounded-rectangle',
      position: { x: 100, y: 100 },
      size: { width: 140, height: 70 },
      data: {
        label: 'Start',
        style: {
          backgroundColor: '#10B981',
          textColor: '#FFFFFF'
        }
      }
    },
    {
      id: 'node-2',
      type: 'diamond',
      position: { x: 350, y: 115 },
      size: { width: 120, height: 120 },
      data: {
        label: 'Decision?',
        style: {
          backgroundColor: '#F59E0B',
          textColor: '#FFFFFF'
        }
      }
    },
    {
      id: 'node-3',
      type: 'hexagon',
      position: { x: 550, y: 100 },
      size: { width: 140, height: 70 },
      data: {
        label: 'Process',
        style: {
          backgroundColor: '#8B5CF6',
          textColor: '#FFFFFF'
        }
      }
    },
    {
      id: 'node-4',
      type: 'triangle',
      position: { x: 300, y: 300 },
      size: { width: 100, height: 80 },
      data: {
        label: 'Yes',
        style: {
          backgroundColor: '#10B981',
          textColor: '#FFFFFF'
        }
      }
    },
    {
      id: 'node-5',
      type: 'star',
      position: { x: 500, y: 280 },
      size: { width: 90, height: 90 },
      data: {
        label: 'Success!',
        style: {
          backgroundColor: '#EF4444',
          textColor: '#FFFFFF'
        }
      }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      type: 'straight',
      data: {
        label: 'Process Flow',
        style: {
          strokeColor: '#6B7280',
          strokeWidth: 3,
          arrowhead: 'arrow'
        }
      }
    },
    {
      id: 'edge-2',
      source: 'node-2',
      target: 'node-3',
      type: 'straight',
      data: {
        label: 'Final Step',
        style: {
          strokeColor: '#6B7280',
          strokeWidth: 3,
          arrowhead: 'arrow'
        }
      }
    }
  ],
  layout: {
    type: 'flowchart',
    direction: 'horizontal',
    spacing: {
      horizontal: 80,
      vertical: 50,
      node: 30
    }
  },
  metadata: {
    title: 'Sample Workflow Diagram',
    description: 'A professional workflow diagram example',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'React SmartArt Library'
  }
};

export default function Home() {
  const [diagramData, setDiagramData] = useState<SmartDiagramData>(sampleData);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);

  const handleDiagramChange = (data: SmartDiagramData) => {
    setDiagramData(data);

    // Update selectedNode/selectedEdge references if they exist in the new data
    if (selectedNode) {
      const updatedNode = data.nodes.find(node => node.id === selectedNode.id);
      setSelectedNode(updatedNode || null);
    }

    if (selectedEdge) {
      const updatedEdge = data.edges.find(edge => edge.id === selectedEdge.id);
      setSelectedEdge(updatedEdge || null);
    }
  };

  const exportToJSON = () => {
    const json = JSON.stringify(diagramData, null, 2);
    setJsonOutput(json);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.json';
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importFromJSON = () => {
    try {
      const data = ExportUtils.importFromJSON(jsonOutput);
      setDiagramData(data);
      setJsonOutput('');
    } catch (error) {
      alert('Invalid JSON format or diagram structure');
    }
  };

  const loadSampleDiagram = () => {
    setDiagramData(sampleData);
  };

  const clearDiagram = () => {
    const emptyData: SmartDiagramData = {
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
    setDiagramData(emptyData);
  };

  return (
    <>
      <Head>
        <title>React SmartArt Diagram Library</title>
        <meta name="description" content="Open-Source SmartArt for Modern Web Apps" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Header>
          <Container>
            <Grid fluid>
              <Row>
                <Col xs={16}>
                  <div>
                    <h1>React SmartArt</h1>
                    <p>Open-Source SmartArt for Modern Web Apps</p>
                  </div>
                </Col>
                <Col xs={8} style={{ textAlign: 'right' }}>
                  <ButtonGroup>
                    <Button appearance="primary" onClick={loadSampleDiagram}>
                      Load Sample
                    </Button>
                    <Button appearance="ghost" onClick={clearDiagram}>
                      Clear Diagram
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </Grid>
          </Container>
        </Header>

        <Content>
          <Container>
            <Grid fluid>
              <Row gutter={24}>
                <Col xs={24} md={16}>
                  <Panel
                    header={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ margin: 0 }}>Interactive Diagram Canvas</h3>
                        <Badge content={`${diagramData.nodes.length} nodes, ${diagramData.edges.length} connections`} />
                      </div>
                    }
                    bordered
                  >
                    <SmartDiagram
                      data={diagramData}
                      width="100%"
                      height="500"
                      editable={true}
                      onChange={handleDiagramChange}
                      onNodeSelect={(node) => {
                        setSelectedNode(node);
                        setSelectedEdge(null);
                      }}
                      onEdgeSelect={(edge) => {
                        setSelectedEdge(edge);
                        setSelectedNode(null);
                      }}
                    />
                  </Panel>
                </Col>

                <Col xs={24} md={8}>
                  <div>
                    <Panel header="Export & Import" bordered style={{ marginBottom: 20 }}>
                      <div>
                        <ButtonGroup justified style={{ marginBottom: 16 }}>
                          <Button
                            appearance="primary"
                            color="orange"
                            onClick={() => {
                              const diagramElement = document.querySelector('.diagram-container') as HTMLElement;
                              if (diagramElement) {
                                ExportUtils.exportAsPNG(diagramElement, 'diagram.png');
                              } else {
                                alert('Diagram element not found');
                              }
                            }}
                          >
                            PNG
                          </Button>
                          <Button
                            appearance="primary"
                            color="red"
                            onClick={() => ExportUtils.exportAsSVG(diagramData, 'diagram.svg')}
                          >
                            SVG
                          </Button>
                          <Button
                            appearance="primary"
                            color="violet"
                            onClick={exportToJSON}
                          >
                            JSON
                          </Button>
                        </ButtonGroup>

                        <Button
                          block
                          appearance="primary"
                          color="green"
                          onClick={importFromJSON}
                          disabled={!jsonOutput.trim()}
                          style={{ marginBottom: 16 }}
                        >
                          Import from JSON
                        </Button>

                        <Input
                          as="textarea"
                          rows={6}
                          placeholder="Paste JSON here to import..."
                          value={jsonOutput}
                          onChange={setJsonOutput}
                        />
                      </div>
                    </Panel>

                    <Panel header="How to Use" bordered style={{ marginBottom: 20 }}>
                      <div>
                        <div style={{ marginBottom: 12 }}>
                          <Badge content="1" color="blue" style={{ marginRight: 8 }} />
                          <strong>Click</strong> on nodes or edges to select them
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Badge content="2" color="green" style={{ marginRight: 8 }} />
                          <strong>Drag</strong> nodes to reposition them
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Badge content="3" color="red" style={{ marginRight: 8 }} />
                          <strong>Ctrl+Drag</strong> from node to node to create connections
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Badge content="4" color="violet" style={{ marginRight: 8 }} />
                          <strong>Property Panel</strong> - Edit selected items below
                        </div>
                        <div>
                          <Badge content="5" color="orange" style={{ marginRight: 8 }} />
                          <strong>Delete</strong> key removes selected items
                        </div>
                      </div>
                    </Panel>

                    {(selectedNode || selectedEdge) && (
                      <Panel header="Selected Item" bordered style={{ marginBottom: 20 }}>
                        {selectedNode && (
                          <div>
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Type:</label>
                            <select
                              value={selectedNode.type}
                              onChange={(e) => {
                                const newType = e.target.value as any;
                                const updatedNodes = diagramData.nodes.map(node =>
                                  node.id === selectedNode.id
                                    ? { ...node, type: newType }
                                    : node
                                );
                                const newData = {
                                  ...diagramData,
                                  nodes: updatedNodes,
                                  metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                };
                                handleDiagramChange(newData);
                              }}
                              style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                            >
                              <option value="rectangle">Rectangle</option>
                              <option value="rounded-rectangle">Rounded Rectangle</option>
                              <option value="circle">Circle</option>
                              <option value="ellipse">Ellipse</option>
                              <option value="diamond">Diamond</option>
                              <option value="triangle">Triangle</option>
                              <option value="hexagon">Hexagon</option>
                              <option value="pentagon">Pentagon</option>
                              <option value="star">Star</option>
                              <option value="parallelogram">Parallelogram</option>
                              <option value="trapezoid">Trapezoid</option>
                            </select>
                          </div>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Label:</label>
                              <Input
                                value={selectedNode.data.label}
                                onChange={(value) => {
                                  const updatedNodes = diagramData.nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? { ...node, data: { ...node.data, label: value } }
                                      : node
                                  );
                                  const newData = {
                                    ...diagramData,
                                    nodes: updatedNodes,
                                    metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                  };
                                  handleDiagramChange(newData);
                                }}
                                placeholder="Enter node label"
                              />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Background Color:</label>
                              <input
                                type="color"
                                value={selectedNode.data.style?.backgroundColor || '#10B981'}
                                onChange={(e) => {
                                  const updatedNodes = diagramData.nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            style: { ...(node.data.style || {}), backgroundColor: e.target.value }
                                          }
                                        }
                                      : node
                                  );
                                  const newData = {
                                    ...diagramData,
                                    nodes: updatedNodes,
                                    metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                  };
                                  handleDiagramChange(newData);
                                }}
                                style={{ width: '100%', height: '32px', border: '1px solid #ccc', borderRadius: '4px' }}
                              />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Text Color:</label>
                              <input
                                type="color"
                                value={selectedNode.data.style?.textColor || '#FFFFFF'}
                                onChange={(e) => {
                                  const updatedNodes = diagramData.nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            style: { ...(node.data.style || {}), textColor: e.target.value }
                                          }
                                        }
                                      : node
                                  );
                                  const newData = {
                                    ...diagramData,
                                    nodes: updatedNodes,
                                    metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                  };
                                  handleDiagramChange(newData);
                                }}
                                style={{ width: '100%', height: '32px', border: '1px solid #ccc', borderRadius: '4px' }}
                              />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Width:</label>
                              <Input
                                type="number"
                                value={selectedNode.size.width}
                                onChange={(value) => {
                                  const width = parseInt(value) || 120;
                                  const updatedNodes = diagramData.nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? { ...node, size: { ...node.size, width } }
                                      : node
                                  );
                                  const newData = {
                                    ...diagramData,
                                    nodes: updatedNodes,
                                    metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                  };
                                  handleDiagramChange(newData);
                                }}
                                min={50}
                                max={400}
                              />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Height:</label>
                              <Input
                                type="number"
                                value={selectedNode.size.height}
                                onChange={(value) => {
                                  const height = parseInt(value) || 60;
                                  const updatedNodes = diagramData.nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? { ...node, size: { ...node.size, height } }
                                      : node
                                  );
                                  const newData = {
                                    ...diagramData,
                                    nodes: updatedNodes,
                                    metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                  };
                                  handleDiagramChange(newData);
                                }}
                                min={30}
                                max={300}
                              />
                            </div>

                            <div>
                              <strong>Position:</strong> ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
                            </div>
                          </div>
                        )}

                        {selectedEdge && (
                          <div>
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Label:</label>
                              <Input
                                value={selectedEdge.data.label || ''}
                                onChange={(value) => {
                                  const updatedEdges = diagramData.edges.map(edge =>
                                    edge.id === selectedEdge.id
                                      ? { ...edge, data: { ...edge.data, label: value || undefined } }
                                      : edge
                                  );
                                  const newData = {
                                    ...diagramData,
                                    edges: updatedEdges,
                                    metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                  };
                                  handleDiagramChange(newData);
                                }}
                                placeholder="Enter edge label"
                              />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Stroke Color:</label>
                              <input
                                type="color"
                                value={selectedEdge.data.style?.strokeColor || '#6B7280'}
                                onChange={(e) => {
                                  const updatedEdges = diagramData.edges.map(edge =>
                                    edge.id === selectedEdge.id
                                      ? {
                                          ...edge,
                                          data: {
                                            ...edge.data,
                                            style: { ...(edge.data.style || {}), strokeColor: e.target.value }
                                          }
                                        }
                                      : edge
                                  );
                                  const newData = {
                                    ...diagramData,
                                    edges: updatedEdges,
                                    metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                  };
                                  handleDiagramChange(newData);
                                }}
                                style={{ width: '100%', height: '32px', border: '1px solid #ccc', borderRadius: '4px' }}
                              />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Stroke Width:</label>
                              <Input
                                type="number"
                                value={selectedEdge.data.style?.strokeWidth || 2}
                                onChange={(value) => {
                                  const strokeWidth = parseInt(value) || 2;
                                  const updatedEdges = diagramData.edges.map(edge =>
                                    edge.id === selectedEdge.id
                                      ? {
                                          ...edge,
                                          data: {
                                            ...edge.data,
                                            style: { ...(edge.data.style || {}), strokeWidth }
                                          }
                                        }
                                      : edge
                                  );
                                  const newData = {
                                    ...diagramData,
                                    edges: updatedEdges,
                                    metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                  };
                                  handleDiagramChange(newData);
                                }}
                                min={1}
                                max={10}
                              />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Arrowhead:</label>
                              <select
                                value={selectedEdge.data.style?.arrowhead || 'none'}
                                onChange={(e) => {
                                  const arrowhead = e.target.value as 'none' | 'arrow';
                                  const updatedEdges = diagramData.edges.map(edge =>
                                    edge.id === selectedEdge.id
                                      ? {
                                          ...edge,
                                          data: {
                                            ...edge.data,
                                            style: { ...(edge.data.style || {}), arrowhead }
                                          }
                                        }
                                      : edge
                                  );
                                  const newData = {
                                    ...diagramData,
                                    edges: updatedEdges,
                                    metadata: { ...diagramData.metadata, updatedAt: new Date() }
                                  };
                                  handleDiagramChange(newData);
                                }}
                                style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                              >
                                <option value="none">None</option>
                                <option value="arrow">Arrow</option>
                              </select>
                            </div>

                            <div><strong>From:</strong> {selectedEdge.source}</div>
                            <div><strong>To:</strong> {selectedEdge.target}</div>
                          </div>
                        )}
                      </Panel>
                    )}

                    <Panel header="Features" bordered>
                      <div>
                        <div style={{ color: '#52c41a', fontWeight: 'bold', marginBottom: 8 }}>✓ Drag & Drop Interface</div>
                        <div style={{ color: '#1890ff', fontWeight: 'bold', marginBottom: 8 }}>✓ Auto Layout Algorithms</div>
                        <div style={{ color: '#722ed1', fontWeight: 'bold', marginBottom: 8 }}>✓ Undo/Redo System</div>
                        <div style={{ color: '#fa8c16', fontWeight: 'bold', marginBottom: 8 }}>✓ Export to PNG/SVG/JSON</div>
                        <div style={{ color: '#13c2c2', fontWeight: 'bold', marginBottom: 8 }}>✓ Smooth Animations</div>
                        <div style={{ color: '#f5222d', fontWeight: 'bold', marginBottom: 8 }}>✓ TypeScript Support</div>
                        <div style={{ color: '#2f54eb', fontWeight: 'bold' }}>✓ Responsive Design</div>
                      </div>
                    </Panel>
                  </div>
                </Col>
              </Row>
            </Grid>
          </Container>
        </Content>

        <Footer>
          <Container>
            <div>
              <p>Built with ❤️ using React, TypeScript, and Next.js</p>
              <p>Open-source SmartArt diagram library for modern web applications</p>
            </div>
          </Container>
        </Footer>
      </Container>
    </>
  );
}
