import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Save } from 'lucide-react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    type Connection,
    type Edge,
    type Node,
} from 'reactflow';

import { executeWorkflow, getExecutionDetails, getWorkflowById, updateWorkflow } from '../api';
import { Sidebar } from '../components/Sidebar';
import { SettingsPanel } from '../components/SettingsPanel';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import CustomNode from '../components/CustomNode';
import type { Execution, Workflow, WorkflowNode } from '../../../types';
import { useError } from '../../../providers/ErrorProvider';

const nodeTypes = {
    customInput: CustomNode,
    customDefault: CustomNode,
    customOutput: CustomNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

export const WorkflowDetailPage = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const { workflowId } = useParams<{ workflowId: string }>();
    const { showError } = useError();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    const workflowIdNum = parseInt(workflowId!, 10);

    const clearPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const fetchWorkflow = async () => {
        try {
            const data = await getWorkflowById(workflowIdNum);
            setWorkflow(data);
            id = data.nodes.length;
            const formattedNodes = data.nodes.map(node => ({
                ...node,
                position: typeof node.position === 'string' ? JSON.parse(node.position) : node.position,
            }));
            setNodes(formattedNodes || []);
            setEdges(data.edges || []);
        } catch (error) {
            showError('Failed to load workflow');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (workflowIdNum) {
            fetchWorkflow();
        }

        return () => clearPolling();
    }, [workflowIdNum, setNodes, setEdges]);

    const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            if (!reactFlowWrapper.current || !reactFlowInstance) return;

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('text/plain');

            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const defaultData = {
                label: label || `${type} node`,
                status: 'pending',
                output: null,
                error: null,
                ...(type === 'text_input' && { text: 'Default input text...' }),
            };

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: defaultData,
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    };
    
    const onPaneClick = () => {
        setSelectedNode(null);
    }
    
    const onUpdateNodeData = (nodeId: string, data: any) => {
        setNodes((nds) => 
            nds.map((node) => 
                node.id === nodeId ? { ...node, data: {...node.data, ...data} } : node
            )
        );
        if (selectedNode && selectedNode.id === nodeId) {
            setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
        }
    };

    const handleSave = async () => {
        if (!workflow) return;
        setIsSaving(true);
        const nodeToSave: WorkflowNode[] = nodes.map((node) => {
            return {
                id: node.id,
                type: node.type || 'default',
                data: node.data,
                position: node.position
            };
        });
        try {
            await updateWorkflow(workflow.id, {
                name: workflow.name,
                nodes: nodeToSave,
                edges: edges,
            });
            showError('Workflow saved successfully!', 'success');
        } catch (error) {
            showError('Failed to save workflow');
            console.error("Failed to save workflow", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecute = async () => {
        await handleSave();
        setIsExecuting(true);
        
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: { ...node.data, status: 'pending', output: null, error: null },
            }))
        );

        try {
            const { execution_id } = await executeWorkflow(workflowIdNum);
            
            setNodes((nds) =>
                nds.map((node) => ({
                    ...node,
                    data: { ...node.data, status: 'running' },
                }))
            );
            
            pollingIntervalRef.current = setInterval(async () => {
                const details: Execution = await getExecutionDetails(execution_id);
                
                if (details.status === 'COMPLETED') {
                    setNodes((nds) => 
                        nds.map((node) => {
                            const result = details.results?.[node.id];
                            return { 
                                ...node, 
                                data: { 
                                    ...node.data, 
                                    status: 'completed', 
                                    output: result || null,
                                    error: null 
                                } 
                            };
                        })
                    );
                    clearPolling();
                    setIsExecuting(false);
                    showError('Workflow executed successfully!', 'success');
                } else if (details.status === 'FAILED') {
                    setNodes((nds) => 
                        nds.map((node) => {
                            const error = details.results?.error;
                            return { 
                                ...node, 
                                data: { 
                                    ...node.data, 
                                    status: 'failed', 
                                    output: null,
                                    error: typeof error === 'string' ? error : 'Execution failed' 
                                } 
                            };
                        })
                    );
                    clearPolling();
                    setIsExecuting(false);
                    showError('Workflow execution failed.', 'error');
                } else if (details.status === 'RUNNING') {
                    setNodes((nds) => 
                        nds.map((node) => {
                            const result = details.results?.[node.id];
                            if (result !== undefined && result !== null) {
                                return { 
                                    ...node, 
                                    data: { 
                                        ...node.data, 
                                        status: 'completed', 
                                        output: result,
                                        error: null 
                                    } 
                                };
                            }
                            return node;
                        })
                    );
                }
            }, 1000);
        } catch (error) {
            showError('Failed to start workflow execution');
            setIsExecuting(false);
            setNodes((nds) =>
                nds.map((node) => ({
                    ...node,
                    data: { ...node.data, status: 'pending', output: null, error: 'Failed to start execution' },
                }))
            );
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
    }

    return (
        <div className="flex h-[calc(100vh-73px)] w-full bg-white">
            <ReactFlowProvider>
                <Sidebar />
                <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
                    <div className="absolute top-4 right-80 z-10 flex space-x-2">
                        <Button 
                            onClick={handleSave} 
                            isLoading={isSaving}
                            className="shadow-md"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Workflow'}
                        </Button>

                        <Button 
                            onClick={handleExecute} 
                            isLoading={isExecuting} 
                            className="shadow-md bg-green-600 hover:bg-green-700"
                            disabled={nodes.length === 0}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            {isExecuting ? 'Executing...' : 'Run Workflow'}
                        </Button>
                    </div>
                    
                    {workflow && (
                        <div className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">{workflow.name}</h2>
                        </div>
                    )}
                    
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        fitView
                        nodeTypes={nodeTypes}
                        className="bg-gray-50"
                    >
                        <Controls 
                            className="bg-white shadow-sm border border-gray-200 rounded-lg"
                            style={{ bottom: 10, right: 10, top: 'auto', left: 'auto' }}
                        />
                        <MiniMap 
                            className="bg-white shadow-sm border border-gray-200 rounded-lg"
                            style={{ bottom: 10, left: 10, top: 'auto', right: 'auto' }}
                            nodeColor="#ddd"
                            maskColor="rgba(0, 0, 0, 0.1)"
                        />
                        <Background gap={16} size={1} color="#e5e7eb" />
                    </ReactFlow>
                </div>
                <SettingsPanel selectedNode={selectedNode} onUpdateNodeData={onUpdateNodeData} />
            </ReactFlowProvider>
        </div>
    );
};