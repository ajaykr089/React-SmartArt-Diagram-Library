import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { DiagramNode, Position } from '../types/diagram';

interface DraggableNodeProps {
  node: DiagramNode;
  zoom: number;
  offset: Position;
  isSelected: boolean;
  onNodeClick: (node: DiagramNode) => void;
  onNodeMove: (nodeId: string, newPosition: Position) => void;
  onNodeDrop?: (nodeId: string, dropPosition: Position) => void;
}

interface DragItem {
  type: 'node';
  id: string;
  node: DiagramNode;
}

const DraggableNodeComponent: React.FC<DraggableNodeProps> = ({
  node,
  zoom,
  offset,
  isSelected,
  onNodeClick,
  onNodeMove,
  onNodeDrop
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'node',
    item: { type: 'node', id: node.id, node },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'node',
    drop: (item: DragItem, monitor) => {
      if (item.id === node.id) return; // Don't drop on self

      const offset = monitor.getSourceClientOffset();
      if (offset && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const dropPosition = {
          x: (offset.x - rect.left) / zoom,
          y: (offset.y - rect.top) / zoom
        };
        onNodeDrop?.(item.id, dropPosition);
      }
    },
  });

  drag(drop(ref));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick(node);
  };

  const transformedPosition = {
    x: (node.position.x + offset.x) * zoom,
    y: (node.position.y + offset.y) * zoom
  };

  const transformedSize = {
    width: node.size.width * zoom,
    height: node.size.height * zoom
  };



  return (
    <div
      ref={ref}
      className={`absolute cursor-move select-none`}
      style={{
        left: transformedPosition.x,
        top: transformedPosition.y,
        width: Math.max(transformedSize.width, 50),
        height: Math.max(transformedSize.height, 30),
        zIndex: isSelected ? 10 : 1
      }}
      onClick={handleClick}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isDragging ? 1.05 : 1,
          opacity: isDragging ? 0.8 : 1,
          rotate: isSelected ? 0 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 0.2
        }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.1 }
        }}
        whileTap={{
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
      >
      {/* Selection ring */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 ring-2 ring-blue-500 ring-opacity-50 rounded"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Node background */}
      <div
        className={`w-full h-full border-2 flex items-center justify-center text-center p-2 transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        style={{
          borderRadius: node.data.style?.borderRadius || 4,
          backgroundColor: node.data.style?.backgroundColor || '#ffffff',
          borderColor: isSelected
            ? '#3b82f6'
            : (node.data.style?.borderColor || '#d1d5db'),
          fontSize: (node.data.style?.fontSize || 14) * zoom,
          fontFamily: node.data.style?.fontFamily || 'Arial, sans-serif',
          fontWeight: node.data.style?.fontWeight || 'normal',
          color: node.data.style?.textColor || '#111827',
          boxShadow: isSelected
            ? '0 10px 25px rgba(59, 130, 246, 0.3)'
            : '0 5px 15px rgba(0, 0, 0, 0.1)'
        }}
      >
        {node.data.label}
      </div>

      {/* Resize handles when selected */}
      {isSelected && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          {/* Corner resize handles */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize hover:bg-blue-600 transition-colors" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize hover:bg-blue-600 transition-colors" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize hover:bg-blue-600 transition-colors" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 transition-colors" />

          {/* Edge resize handles */}
          <div className="absolute top-1/2 -left-1 w-2 h-6 bg-blue-500 rounded cursor-w-resize transform -translate-y-1/2 hover:bg-blue-600 transition-colors" />
          <div className="absolute top-1/2 -right-1 w-2 h-6 bg-blue-500 rounded cursor-e-resize transform -translate-y-1/2 hover:bg-blue-600 transition-colors" />
          <div className="absolute left-1/2 -top-1 w-6 h-2 bg-blue-500 rounded cursor-n-resize transform -translate-x-1/2 hover:bg-blue-600 transition-colors" />
          <div className="absolute left-1/2 -bottom-1 w-6 h-2 bg-blue-500 rounded cursor-s-resize transform -translate-x-1/2 hover:bg-blue-600 transition-colors" />
        </motion.div>
      )}
      </motion.div>
    </div>
  );
};

export const DraggableNode = React.memo(DraggableNodeComponent);
