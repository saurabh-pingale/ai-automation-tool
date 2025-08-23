import React from 'react';
import { Hash, Settings, Tag } from 'lucide-react';

interface SettingsPanelProps {
    selectedNode: any;
    onUpdateNodeData: (nodeId: string, data: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ selectedNode, onUpdateNodeData }) => {
    const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedNode) {
            onUpdateNodeData(selectedNode.id, { ...selectedNode.data, label: event.target.value });
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
                        <label htmlFor="node-label" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            Node Label
                        </label>
                        <input
                            id="node-label"
                            type="text"
                            value={selectedNode.data?.label || ''}
                            onChange={handleLabelChange}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm placeholder-gray-400 
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                     transition-colors duration-200"
                            placeholder="Enter node label"
                        />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Node Type</h3>
                        <div className="text-sm text-gray-600 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg inline-block">
                            {selectedNode.type || 'default'}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Select a node to configure its properties</p>
                </div>
            )}
        </aside>
    );
};