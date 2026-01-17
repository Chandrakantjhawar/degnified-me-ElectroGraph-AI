
import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    MiniMap,
    Panel,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { generateDiagramFromPrompt } from './utils/generator';
import { Download, Save, Plus, Trash2, Cpu, Zap, Radio, ArrowRight, Settings, X, Edit2, GripVertical } from 'lucide-react';
import { toPng } from 'html-to-image';
import CustomNode from './components/CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

const INITIAL_NODES = [
    {
        id: '1',
        type: 'custom',
        position: { x: 400, y: 300 },
        data: { label: 'Start Here', sublabel: 'System', type: 'control', color: '#8b5cf6' }
    }
];

const SECTIONS = {
    POWER: { id: 'power', label: 'Power', color: '#ef4444', icon: Zap },
    INPUTS: { id: 'inputs', label: 'Input', color: '#3b82f6', icon: Settings },
    CONTROL: { id: 'control', label: 'Control', color: '#8b5cf6', icon: Cpu },
    OUTPUTS: { id: 'outputs', label: 'Output', color: '#10b981', icon: ArrowRight },
    OTHER: { id: 'other', label: 'Other', color: '#f59e0b', icon: Radio }
};

export default function DiagramBuilder() {
    const [nodes, setNodes] = useState(INITIAL_NODES);
    const [edges, setEdges] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const reactFlowWrapper = useRef(null);

    // Update Generator to use 'custom' type
    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        setLoading(true);

        setTimeout(() => {
            const { nodes: rawNodes, edges: newEdges } = generateDiagramFromPrompt(prompt);
            // Transform raw nodes to custom nodes
            const newNodes = rawNodes.map(n => ({
                ...n,
                type: 'custom',
                data: {
                    ...n.data,
                    color: n.style.border.split(' ')[2], // Extract color from style we set in generator
                    type: Object.values(SECTIONS).find(s => s.color === n.style.border.split(' ')[2])?.id || 'default',
                    sublabel: Object.values(SECTIONS).find(s => s.color === n.style.border.split(' ')[2])?.label || 'Component'
                },
                style: undefined // Remove inline style in favor of CustomNode internal style
            }));

            setNodes(newNodes);
            setEdges(newEdges);
            setLoading(false);
        }, 800);
    };

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        []
    );

    const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
        setSelectedElement(selectedNodes[0] || selectedEdges[0] || null);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedElement(null);
    }, []);

    const updateSelectedLabel = (newLabel) => {
        if (!selectedElement || !selectedElement.data) return;
        setNodes((nds) => nds.map((node) => {
            if (node.id === selectedElement.id) {
                return { ...node, data: { ...node.data, label: newLabel } };
            }
            return node;
        }));
        // Update local state to reflect change immediately in UI
        setSelectedElement(prev => ({ ...prev, data: { ...prev.data, label: newLabel } }));
    };

    const deleteSelected = () => {
        if (!selectedElement) return;
        if (selectedElement.source) {
            // It's an edge
            setEdges((eds) => eds.filter((e) => e.id !== selectedElement.id));
        } else {
            // It's a node
            setNodes((nds) => nds.filter((n) => n.id !== selectedElement.id));
            // Remove connected edges
            setEdges((eds) => eds.filter((e) => e.source !== selectedElement.id && e.target !== selectedElement.id));
        }
        setSelectedElement(null);
    };

    const addBlock = (key) => {
        const section = SECTIONS[key];
        const id = Date.now().toString();
        const newNode = {
            id,
            type: 'custom',
            position: { x: 400 + Math.random() * 50, y: 300 + Math.random() * 50 },
            data: {
                label: `New ${section.label}`,
                sublabel: section.label,
                type: section.id,
                color: section.color
            }
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const handleExportJson = () => {
        const data = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `diagram-${prompt.substring(0, 10).replace(/\s+/g, '_') || 'export'}.json`;
        link.click();
    };

    const handleExportPng = () => {
        if (reactFlowWrapper.current === null) return;

        // Selecting the flow element to capture
        const flowElement = document.querySelector('.react-flow__viewport');

        toPng(reactFlowWrapper.current, { cacheBust: true, backgroundColor: '#09090b', quality: 1.0, pixelRatio: 2 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `diagram-${prompt.substring(0, 10).replace(/\s+/g, '_') || 'export'}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('oops, something went wrong!', err);
            });
    };


    return (
        <div className="w-full h-full flex flex-col" style={{ height: '100vh', width: '100vw' }}>

            {/* Header */}
            <header style={{
                height: 'var(--header-height)',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '6px', borderRadius: '8px' }}>
                        <Cpu size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>ElectroGraph AI</h1>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary" onClick={handleExportPng} title="Save as Image">
                        <Save size={16} /> PNG
                    </button>
                    <button className="btn-secondary" onClick={handleExportJson} title="Save as JSON">
                        <Download size={16} /> JSON
                    </button>
                    <button className="btn-primary" style={{ padding: '0.5rem 1.5rem' }} onClick={() => { setNodes([]); setEdges([]); setPrompt(''); }}>
                        Clear Canvas
                    </button>
                </div>
            </header>

            {/* Main Canvas Area */}
            <div style={{ flex: 1, height: 'calc(100vh - 64px)', position: 'relative', display: 'flex', overflow: 'hidden' }} ref={reactFlowWrapper}>

                {/* Left Toolbar */}
                <div style={{
                    width: '60px',
                    background: 'var(--bg-card)',
                    borderRight: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '1rem 0',
                    gap: '1rem',
                    zIndex: 5
                }}>
                    {Object.keys(SECTIONS).map(key => {
                        const Item = SECTIONS[key];
                        return (
                            <button
                                key={key}
                                onClick={() => addBlock(key)}
                                title={`Add ${Item.label}`}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    background: Item.color + '20', // 20% opacity
                                    border: `1px solid ${Item.color}`,
                                    color: Item.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s'
                                }}
                                className="hover-scale"
                            >
                                <Item.icon size={20} />
                            </button>
                        )
                    })}
                </div>

                <div style={{ flex: 1, position: 'relative', height: '100%', width: '100%' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onSelectionChange={onSelectionChange}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-dots"
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Background color="#333" gap={20} />
                        <Controls />
                        <MiniMap style={{ background: 'var(--bg-card)', borderColor: 'var(--border-light)' }}
                            nodeColor={(n) => n.data?.color || '#fff'}
                        />
                    </ReactFlow>
                </div>

                {/* Right Properties Panel (Conditional) */}
                {selectedElement && (
                    <div style={{
                        width: '300px',
                        background: 'var(--bg-card)',
                        borderLeft: '1px solid var(--border-light)',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        zIndex: 5
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Properties</h3>
                            <button onClick={() => setSelectedElement(null)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {selectedElement.source ? (
                            // Edge Properties
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Connection ID</span>
                                    <div style={{ fontFamily: 'monospace', marginTop: '4px' }}>{selectedElement.id}</div>
                                </div>
                                <button className="btn-secondary" onClick={deleteSelected} style={{ color: '#ff4444', borderColor: '#ff4444', justifyContent: 'center' }}>
                                    <Trash2 size={16} /> Delete Connection
                                </button>
                            </div>
                        ) : (
                            // Node Properties
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '6px' }}>Label</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={selectedElement.data?.label || ''}
                                            onChange={(e) => updateSelectedLabel(e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '6px' }}>Type</label>
                                    <div style={{ padding: '8px', background: selectedElement.data?.color, borderRadius: '6px', color: 'white', fontWeight: 500, display: 'inline-block' }}>
                                        {selectedElement.data?.sublabel || 'Unknown'}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <button className="btn-secondary" onClick={deleteSelected} style={{ width: '100%', color: '#ff4444', borderColor: '#ff4444', justifyContent: 'center' }}>
                                        <Trash2 size={16} /> Delete Component
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#60a5fa' }}>Tips</h4>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                                <li>Drag handles (dots) to connect blocks.</li>
                                <li>Select a connection to delete it.</li>
                                <li>Double click on canvas to deselect.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Floating AI Input (only if no selection) */}
                {!selectedElement && (
                    <div style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: '600px',
                        zIndex: 10
                    }}>
                        <form onSubmit={handleGenerate} className="glass" style={{
                            padding: '0.5rem',
                            borderRadius: '50px',
                            display: 'flex',
                            gap: '0.5rem',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                background: 'var(--bg-card)',
                                borderRadius: '50%',
                                marginLeft: '4px'
                            }}>
                                <Zap size={20} color={loading ? 'yellow' : 'var(--primary)'} className={loading ? 'animate-pulse' : ''} />
                            </div>
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your electronics product (e.g., 'Smart doorbell with camera')..."
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1rem',
                                    padding: '0 0.5rem',
                                    outline: 'none'
                                }}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ borderRadius: '40px', padding: '0.5rem 1.5rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : 'Generate'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
