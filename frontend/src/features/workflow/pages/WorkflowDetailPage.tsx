import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
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

import { getWorkflowById, updateWorkflow } from '../api';
import { Sidebar } from '../components/Sidebar';
import { SettingsPanel } from '../components/SettingsPanel';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import CustomNode from '../components/CustomNode';
import type { Workflow, WorkflowNode } from '../../../types';

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

    const { workflowId } = useParams<{ workflowId: string }>();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    
    const workflowIdNum = parseInt(workflowId!, 10);

    const fetchWorkflow = async () => {
        try {
            const data = await getWorkflowById(workflowIdNum);
            setWorkflow(data);
            if (data.nodes && data.nodes.length > 0) {
                const formattedNodes = data.nodes.map(node => ({
                    ...node,
                    position: typeof node.position === 'string' ? JSON.parse(node.position) : node.position,
                }));
                setNodes(formattedNodes);
            } else {
                setNodes([]);
            }
            setEdges(data.edges || []);
        } catch (error) {
            console.error("Failed to fetch workflow", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (workflowIdNum) {
            fetchWorkflow();
        }
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

            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { label: `${type} node` },
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
                node.id === nodeId ? { ...node, data: data } : node
            )
        );
        if (selectedNode && selectedNode.id === nodeId) {
            setSelectedNode(prev => prev ? { ...prev, data } : null);
        }
    }

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
            alert('Workflow saved successfully!');
        } catch (error) {
            console.error("Failed to save workflow", error);
            alert('Failed to save workflow.');
        } finally {
            setIsSaving(false);
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
                    <div className="absolute top-4 right-80 z-10">
                        <Button 
                            onClick={handleSave} 
                            isLoading={isSaving}
                            className="shadow-md"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Workflow'}
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