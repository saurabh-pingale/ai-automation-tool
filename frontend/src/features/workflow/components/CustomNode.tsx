import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Settings, ArrowRightCircle, CheckCircle } from 'lucide-react';

const CustomNode = ({ data, type, isConnectable }: NodeProps) => {
  const getNodeStyle = (nodeType: string | undefined) => {
    switch (nodeType) {
      case 'customInput':
        return 'border-green-300 bg-green-50 text-green-800';
      case 'customOutput':
        return 'border-purple-300 bg-purple-50 text-purple-800';
      default:
        return 'border-blue-300 bg-blue-50 text-blue-800';
    }
  };

  const getNodeIcon = (nodeType: string | undefined) => {
    switch (nodeType) {
      case 'customInput':
        return <ArrowRightCircle className="w-4 h-4" />;
      case 'customOutput':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className={`px-4 py-3 shadow-sm rounded-lg border-2 ${getNodeStyle(type)} min-w-[120px]`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
          {getNodeIcon(type)}
        </div>
        <div className="text-sm font-semibold truncate">{data.label}</div>
      </div>

      <Handle 
        type="target" 
        position={Position.Left} 
        id="a"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
        style={{ top: '30%' }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="b"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
        style={{ top: '70%' }}
      />

      <Handle 
        type="source" 
        position={Position.Right}
        id="c" 
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};

export default memo(CustomNode);