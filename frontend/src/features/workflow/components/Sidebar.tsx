import { ArrowRightCircle, CheckCircle, Settings } from 'lucide-react';
import React from 'react';

export const Sidebar = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('text/plain', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    const nodeTypes = [
        { type: 'customInput', label: 'Input Node', icon: <ArrowRightCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
        { type: 'customDefault', label: 'Process Node', icon: <Settings className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
        { type: 'customOutput', label: 'Output Node', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
    ];

    return (
        <aside className="w-64 bg-white p-4 border-r border-gray-200 overflow-y-auto">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Nodes Palette</h2>
                <p className="text-sm text-gray-500">Drag nodes to the canvas to build your workflow</p>
            </div>

            <div className="space-y-3">
                {nodeTypes.map((node) => (
                    <div
                        key={node.type}
                        className={`p-3 border border-gray-200 rounded-lg cursor-grab bg-white shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex items-center space-x-3 ${node.color}`}
                        onDragStart={(event) => onDragStart(event, node.type, node.label)}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm">
                            {node.icon}
                        </div>
                        <span className="text-sm font-medium">{node.label}</span>
                    </div>
                ))}
            </div>
        </aside>
    );
};