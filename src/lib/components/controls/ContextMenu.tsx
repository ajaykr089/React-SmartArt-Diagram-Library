import React, { useEffect, useRef, useState } from 'react';
import { DiagramNode, DiagramEdge } from '../../types/diagram';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  separator?: boolean;
  onClick?: () => void;
  children?: ContextMenuItem[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  target?: DiagramNode | DiagramEdge | null;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  items,
  onClose,
  target
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuVisible, setSubmenuVisible] = useState<string | null>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedPosition = React.useMemo(() => {
    const menuWidth = 200;
    const menuHeight = items.length * 36;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth;
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight;
    }

    return { x: adjustedX, y: adjustedY };
  }, [x, y, items.length]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled || item.separator) return;

    if (item.children) {
      setSubmenuVisible(submenuVisible === item.id ? null : item.id);
    } else {
      item.onClick?.();
      onClose();
    }
  };

  const renderMenuItem = (item: ContextMenuItem, depth = 0) => {
    if (item.separator) {
      return (
        <div
          key={item.id}
          className="context-menu-separator"
          style={{
            height: '1px',
            backgroundColor: 'var(--theme-border)',
            margin: '4px 0'
          }}
        />
      );
    }

    const hasSubmenu = item.children && item.children.length > 0;
    const isSubmenuVisible = submenuVisible === item.id;

    return (
      <div key={item.id} className="context-menu-item-group">
        <div
          className={`context-menu-item ${item.disabled ? 'disabled' : ''} ${hasSubmenu ? 'has-submenu' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            backgroundColor: 'var(--theme-surface)',
            color: item.disabled ? 'var(--theme-textSecondary)' : 'var(--theme-text)',
            fontSize: '14px',
            position: 'relative',
            opacity: item.disabled ? 0.5 : 1
          }}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => {
            if (hasSubmenu && !item.disabled) {
              // Clear any existing timeout
              if (submenuTimeoutRef.current) {
                clearTimeout(submenuTimeoutRef.current);
                submenuTimeoutRef.current = null;
              }
              setSubmenuVisible(item.id);
            }
          }}
          onMouseLeave={() => {
            if (hasSubmenu) {
              // Delay closing to allow mouse movement to submenu
              submenuTimeoutRef.current = setTimeout(() => {
                setSubmenuVisible(null);
              }, 300); // Increased delay for better UX
            }
          }}
        >
          {item.icon && (
            <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </span>
          )}
          <span style={{ flex: 1 }}>{item.label}</span>
          {hasSubmenu && (
            <span style={{ marginLeft: '8px', fontSize: '12px' }}>▶</span>
          )}
        </div>

        {hasSubmenu && isSubmenuVisible && (
          <div
            className="context-menu-submenu"
            style={{
              position: 'absolute',
              left: '100%',
              top: '0',
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              minWidth: '160px',
              zIndex: 1000
            }}
            onMouseEnter={() => {
              // Clear timeout when entering submenu
              if (submenuTimeoutRef.current) {
                clearTimeout(submenuTimeoutRef.current);
                submenuTimeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              // Close submenu when leaving it
              submenuTimeoutRef.current = setTimeout(() => {
                setSubmenuVisible(null);
              }, 300);
            }}
          >
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '160px',
        zIndex: 1000
      }}
    >
      {items.map(item => renderMenuItem(item))}
    </div>
  );
};

// Enhanced context menu items for diagrams
export const createDiagramContextMenu = (
  actions: {
    addNode?: () => void;
    delete?: () => void;
    copy?: () => void;
    paste?: () => void;
    duplicate?: () => void;
    bringToFront?: () => void;
    sendToBack?: () => void;
    properties?: () => void;
    changeType?: (type: string) => void;
    selectAll?: () => void;
    clearSelection?: () => void;
    zoomIn?: () => void;
    zoomOut?: () => void;
    fitToView?: () => void;
    export?: () => void;
  },
  target?: DiagramNode | DiagramEdge | null
): ContextMenuItem[] => {
  const items: ContextMenuItem[] = [];

  // Canvas actions (when no target)
  if (!target) {
    // Creation actions
    items.push({
      id: 'add-node',
      label: 'Add Node',
      icon: '➕',
      onClick: actions.addNode
    });

    if (actions.paste) {
      items.push({
        id: 'paste',
        label: 'Paste',
        icon: '📋',
        onClick: actions.paste
      });
    }

    items.push({ id: 'separator-1', label: '', separator: true });

    // Selection actions
    if (actions.selectAll) {
      items.push({
        id: 'select-all',
        label: 'Select All',
        icon: '☑️',
        onClick: actions.selectAll
      });
    }

    if (actions.clearSelection) {
      items.push({
        id: 'clear-selection',
        label: 'Clear Selection',
        icon: '☐',
        onClick: actions.clearSelection
      });
    }

    items.push({ id: 'separator-2', label: '', separator: true });

    // View actions
    const viewItems: ContextMenuItem[] = [];

    if (actions.zoomIn) {
      viewItems.push({
        id: 'zoom-in',
        label: 'Zoom In',
        icon: '🔍➕',
        onClick: actions.zoomIn
      });
    }

    if (actions.zoomOut) {
      viewItems.push({
        id: 'zoom-out',
        label: 'Zoom Out',
        icon: '🔍➖',
        onClick: actions.zoomOut
      });
    }

    if (actions.fitToView) {
      viewItems.push({
        id: 'fit-to-view',
        label: 'Fit to View',
        icon: '📐',
        onClick: actions.fitToView
      });
    }

    // Add Reset Zoom for canvas
    viewItems.push({
      id: 'reset-zoom',
      label: 'Reset Zoom',
      icon: '🔄',
      onClick: () => {
        // Reset zoom to 1 (100%)
        console.log('Reset zoom to 100%');
      }
    });

    // Add Center View for canvas
    viewItems.push({
      id: 'center-view',
      label: 'Center View',
      icon: '🎯',
      onClick: () => {
        // Center the view
        console.log('Center view');
      }
    });

    if (viewItems.length > 0) {
      items.push({
        id: 'view',
        label: 'View',
        icon: '👁️',
        children: viewItems
      });
    }

    // Export actions
    if (actions.export) {
      items.push({ id: 'separator-3', label: '', separator: true });
      items.push({
        id: 'export',
        label: 'Export',
        icon: '💾',
        onClick: actions.export
      });
    }
  } else if (target && 'type' in target) {
    // Node-specific actions
    const node = target as DiagramNode;

    // Edit actions
    if (actions.copy) {
      items.push({
        id: 'copy',
        label: 'Copy',
        icon: '📋',
        onClick: actions.copy
      });
    }

    if (actions.duplicate) {
      items.push({
        id: 'duplicate',
        label: 'Duplicate',
        icon: '📋',
        onClick: actions.duplicate
      });
    }

    if (actions.paste) {
      items.push({
        id: 'paste',
        label: 'Paste',
        icon: '📋',
        onClick: actions.paste
      });
    }

    items.push({ id: 'separator-1', label: '', separator: true });

    // View actions for nodes
    const viewItems: ContextMenuItem[] = [];

    if (actions.zoomIn) {
      viewItems.push({
        id: 'zoom-in',
        label: 'Zoom In',
        icon: '🔍➕',
        onClick: actions.zoomIn
      });
    }

    if (actions.zoomOut) {
      viewItems.push({
        id: 'zoom-out',
        label: 'Zoom Out',
        icon: '🔍➖',
        onClick: actions.zoomOut
      });
    }

    if (actions.fitToView) {
      viewItems.push({
        id: 'fit-to-view',
        label: 'Fit to View',
        icon: '📐',
        onClick: actions.fitToView
      });
    }

    // Add Reset Zoom for nodes
    viewItems.push({
      id: 'reset-zoom',
      label: 'Reset Zoom',
      icon: '🔄',
      onClick: () => {
        // Reset zoom to 1 (100%)
        if (actions.zoomIn && actions.zoomOut) {
          // This is a simple implementation - in a real app you'd have a resetZoom action
          console.log('Reset zoom to 100%');
        }
      }
    });

    // Add Center View for nodes
    viewItems.push({
      id: 'center-view',
      label: 'Center View',
      icon: '🎯',
      onClick: () => {
        // Center the view on this node
        console.log('Center view on node');
      }
    });

    if (viewItems.length > 0) {
      items.push({
        id: 'view',
        label: 'View',
        icon: '👁️',
        children: viewItems
      });
    }

    items.push({ id: 'separator-2', label: '', separator: true });

    // Layer actions
    const layerItems: ContextMenuItem[] = [];

    if (actions.bringToFront) {
      layerItems.push({
        id: 'bring-to-front',
        label: 'Bring to Front',
        icon: '⬆️',
        onClick: actions.bringToFront
      });
    }

    if (actions.sendToBack) {
      layerItems.push({
        id: 'send-to-back',
        label: 'Send to Back',
        icon: '⬇️',
        onClick: actions.sendToBack
      });
    }

    if (layerItems.length > 0) {
      items.push({
        id: 'layer',
        label: 'Layer',
        icon: '📚',
        children: layerItems
      });
    }

    // Shape change actions
    if (actions.changeType) {
      const shapeItems: ContextMenuItem[] = [
        { id: 'rectangle', label: 'Rectangle', icon: '▭', onClick: () => actions.changeType!('rectangle') },
        { id: 'circle', label: 'Circle', icon: '○', onClick: () => actions.changeType!('circle') },
        { id: 'diamond', label: 'Diamond', icon: '◆', onClick: () => actions.changeType!('diamond') },
        { id: 'triangle', label: 'Triangle', icon: '△', onClick: () => actions.changeType!('triangle') },
        { id: 'hexagon', label: 'Hexagon', icon: '⬡', onClick: () => actions.changeType!('hexagon') },
        { id: 'star', label: 'Star', icon: '⭐', onClick: () => actions.changeType!('star') }
      ];

      items.push({
        id: 'change-shape',
        label: 'Change Shape',
        icon: '🎭',
        children: shapeItems
      });
    }

    // Delete action
    if (actions.delete) {
      items.push({ id: 'separator-3', label: '', separator: true });
      items.push({
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        onClick: actions.delete
      });
    }

    // Properties
    if (actions.properties) {
      items.push({ id: 'separator-4', label: '', separator: true });
      items.push({
        id: 'properties',
        label: 'Properties',
        icon: '⚙️',
        onClick: actions.properties
      });
    }
  } else if (target && 'source' in target) {
    // Edge-specific actions
    const edge = target as DiagramEdge;

    // View actions for edges
    const viewItems: ContextMenuItem[] = [];

    if (actions.zoomIn) {
      viewItems.push({
        id: 'zoom-in',
        label: 'Zoom In',
        icon: '🔍➕',
        onClick: actions.zoomIn
      });
    }

    if (actions.zoomOut) {
      viewItems.push({
        id: 'zoom-out',
        label: 'Zoom Out',
        icon: '🔍➖',
        onClick: actions.zoomOut
      });
    }

    if (actions.fitToView) {
      viewItems.push({
        id: 'fit-to-view',
        label: 'Fit to View',
        icon: '📐',
        onClick: actions.fitToView
      });
    }

    if (viewItems.length > 0) {
      items.push({
        id: 'view',
        label: 'View',
        icon: '👁️',
        children: viewItems
      });
    }

    items.push({ id: 'separator-1', label: '', separator: true });

    // Edit actions
    if (actions.delete) {
      items.push({
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        onClick: actions.delete
      });
    }

    // Properties
    if (actions.properties) {
      items.push({ id: 'separator-2', label: '', separator: true });
      items.push({
        id: 'properties',
        label: 'Properties',
        icon: '⚙️',
        onClick: actions.properties
      });
    }
  }

  return items;
};
