import React from 'react';
import { Hash, MessageSquare, Settings, Tag, Type, CheckCircle, AlertTriangle, Copy } from 'lucide-react';

interface SettingsPanelProps {
    selectedNode: any;
    onUpdateNodeData: (nodeId: string, data: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ selectedNode, onUpdateNodeData }) => {
    const handleDataChange = (field: string, value: string) => {
        if (selectedNode) {
            onUpdateNodeData(selectedNode.id, { 
                ...selectedNode.data,
                [field]: value 
            });
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const formatOutput = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-gray-100 text-gray-700', label: 'Pending' },
            running: { color: 'bg-blue-100 text-blue-700', label: 'Running' },
            completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
            failed: { color: 'bg-red-100 text-red-700', label: 'Failed' },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const renderNodeSpecificSettings = () => {
        if (!selectedNode) return null;

        switch (selectedNode.type) {
            case 'text_input':
                return (
                    <div>
                        <label htmlFor="node-text" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Input Text
                        </label>
                        <textarea
                            id="node-text"
                            rows={4}
                            value={selectedNode.data?.text || ''}
                            onChange={(e) => handleDataChange('text', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                            placeholder="Enter the text to process"
                        />
                    </div>
                );
            case 'gemini_prompt':
                return (
                    <div className="text-sm p-3 bg-gray-50 rounded-lg border">
                        This node uses the incoming data as a prompt for the Gemini API. You can change its label to describe its function.
                    </div>
                );
            case 'output':
                return (
                    <div className="text-sm p-3 bg-purple-50 rounded-lg border border-purple-200">
                        This node displays the final output of your workflow. It will show the result from the previous node.
                    </div>
                );
            default:
                return <p className="text-sm text-gray-500">This node has no specific settings.</p>;
        }
    };

    return (
        <aside className="w-80 bg-white p-6 border-l border-gray-200 overflow-y-auto">
            <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Node Settings</h2>
            </div>
            
            {selectedNode ? (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Hash className="w-4 h-4 mr-2" />
                            Node ID
                        </label>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono">
                            {selectedNode.id}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <div>
                            {getStatusBadge(selectedNode.data?.status || 'pending')}
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="node-label" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            Node Label
                        </label>
                        <input
                            id="node-label"
                            type="text"
                            value={selectedNode.data?.label || ''}
                            onChange={(e) => handleDataChange('label', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            placeholder="Enter node label"
                        />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Type className="w-4 h-4 mr-2" /> 
                            Node Type
                        </h3>
                        <div className="text-sm text-gray-600 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg inline-block">
                            {selectedNode.type || 'default'}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Configuration</h3>
                        {renderNodeSpecificSettings()}
                    </div>

                    {selectedNode.data?.output && (
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                    Output
                                </h3>
                                <button
                                    onClick={() => copyToClipboard(formatOutput(selectedNode.data.output))}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                                >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                </button>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <pre className="text-xs text-green-800 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                                    {formatOutput(selectedNode.data.output)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {selectedNode.data?.error && (
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                                Error
                            </h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <pre className="text-xs text-red-800 whitespace-pre-wrap break-words">
                                    {selectedNode.data.error}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Select a node to configure its properties</p>
                    <p className="text-xs text-gray-400 mt-2">Click on any node to view its settings and execution results</p>
                </div>
            )}
        </aside>
    );
};