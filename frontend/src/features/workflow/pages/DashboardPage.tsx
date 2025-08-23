import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Plus, Square, Workflow } from 'lucide-react';

import { createWorkflow, getWorkflows } from '../api';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import type { Workflow as WorkflowType , WorkflowCreate } from '../../../types';

export const DashboardPage = () => {
    const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const fetchWorkflows = async () => {
        try {
            const data = await getWorkflows();
            setWorkflows(data);
        } catch (error) {
            console.error("Failed to fetch workflows", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const handleCreateWorkflow = async () => {
        setIsCreating(true);
        try {
            const workflowPayload: WorkflowCreate = {
                name: `New Workflow ${workflows.length + 1}`,
                nodes: [],
                edges: [],
            };
            const newWorkflow = await createWorkflow(workflowPayload);
            navigate(`/workflow/${newWorkflow.id}`);
        } catch (error) {
            console.error("Failed to create workflow:", error);
            alert("Error: Could not create the workflow.");
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Workflows</h1>
                    <p className="text-gray-600 mt-2">Create and manage your automation workflows</p>
                </div>
                <Button 
                    onClick={handleCreateWorkflow} 
                    isLoading={isCreating}
                    className="mt-4 sm:mt-0"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Workflow
                </Button>
            </div>

            {workflows.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Workflow className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700">No workflows yet</h3>
                    <p className="text-gray-500 mt-2 mb-6">Get started by creating your first workflow</p>
                    <Button onClick={handleCreateWorkflow} isLoading={isCreating}>
                        Create Workflow
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workflows.map(wf => (
                        <Link to={`/workflow/${wf.id}`} key={wf.id} className="group">
                            <Card className="hover:shadow-lg hover:border-indigo-300 transition-all duration-300 h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800 truncate">{wf.name}</h2>
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Workflow className="w-4 h-4 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <div className="flex items-center mr-4">
                                        <Square className="w-4 h-4 mr-1" />
                                        {wf.nodes.length} nodes
                                    </div>
                                    <div className="flex items-center">
                                        <Link2 className="w-4 h-4 mr-1" />
                                        {wf.edges.length} connections
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-xs text-indigo-600 font-medium group-hover:text-indigo-700">
                                        Edit workflow →
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};