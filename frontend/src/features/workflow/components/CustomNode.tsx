import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Settings, ArrowRightCircle, CheckCircle, XCircle, AlertTriangle, Cpu, Play } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';

type NodeStatus = 'pending' | 'running' | 'completed' | 'failed';

const statusStyles: Record<NodeStatus, { border: string; bg: string }> = {
    pending: { border: 'border-gray-300', bg: 'bg-white' },
    running: { border: 'border-blue-500 ring-2 ring-blue-200', bg: 'bg-blue-50' },
    completed: { border: 'border-green-500', bg: 'bg-green-50' },
    failed: { border: 'border-red-500', bg: 'bg-red-50' },
};

const CustomNode = ({ data, type, isConnectable }: NodeProps) => {
    const { label, status = 'pending', output, error, text } = data as {
        label: string; 
        status?: NodeStatus; 
        output?: any; 
        error?: string;
        text?: string;
    };

    const styles = statusStyles[status];

    const getNodeIcon = () => {
        if (status === 'running') {
            return <Spinner size="sm" />;
        }
        
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                switch (type) {
                    case 'text_input': return <ArrowRightCircle className="w-4 h-4 text-blue-600" />;
                    case 'gemini_prompt': return <Cpu className="w-4 h-4 text-purple-600" />;
                    case 'output': return <CheckCircle className="w-4 h-4 text-green-600" />;
                    default: return <Settings className="w-4 h-4 text-gray-600" />;
                }
        }
    };

    const formatOutput = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value.trim();
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
    };

    const truncateText = (text: string, maxLength: number = 100): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className={`px-4 py-3 shadow-lg rounded-xl border-2 min-w-[200px] max-w-[300px] transition-all duration-300 hover:shadow-xl ${styles.border} ${styles.bg}`}>
            <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border">
                    {getNodeIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{label}</div>
                    <div className="text-xs text-gray-500 capitalize">{status}</div>
                </div>
            </div>

            {type === 'text_input' && text && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs font-medium text-blue-700 mb-1">Input:</div>
                    <div className="text-xs text-blue-800 break-words">
                        {truncateText(text, 80)}
                    </div>
                </div>
            )}

            {output !== undefined && output !== null && (
                <div className="mb-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                        Output
                    </div>
                    <div className="text-xs text-gray-800 break-words leading-relaxed">
                        {formatOutput(output).split('\n').map((line, index) => (
                            <div key={index} className={index > 0 ? 'mt-1' : ''}>
                                {truncateText(line, 150)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-xs font-medium text-red-700 mb-1 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Error
                    </div>
                    <div className="text-xs text-red-800 break-words">
                        {truncateText(error, 100)}
                    </div>
                </div>
            )}

            {status === 'running' && !output && (
                <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center">
                    <Play className="w-3 h-3 mr-2 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">Processing...</span>
                </div>
            )}

            {type !== 'text_input' && (
                <Handle 
                    type="target" 
                    position={Position.Left} 
                    isConnectable={isConnectable}
                    className="w-3 h-3 bg-gray-400 border-2 border-white"
                />
            )}
            {type !== 'output' && (
                <Handle 
                    type="source" 
                    position={Position.Right} 
                    isConnectable={isConnectable}
                    className="w-3 h-3 bg-gray-400 border-2 border-white"
                />
            )}
        </div>
    );
};

export default memo(CustomNode);