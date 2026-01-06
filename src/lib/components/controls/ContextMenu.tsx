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
              setSubmenuVisible(item.id);
            }
          }}
          onMouseLeave={() => {
            if (hasSubmenu) {
              // Keep submenu visible for a short time to allow mouse movement
              setTimeout(() => setSubmenuVisible(null), 100);
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
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {items.map(item => renderMenuItem(item))}
    </div>
  );
};

// Predefined context menu items for diagrams
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
  },
  target?: DiagramNode | DiagramEdge | null
): ContextMenuItem[] => {
  const items: ContextMenuItem[] = [];

  // Add actions
  if (actions.addNode) {
    items.push({
      id: 'add-node',
      label: 'Add Node',
      icon: '➕',
      onClick: actions.addNode
    });
  }

  // Target-specific actions
  if (target) {
    items.push({ id: 'separator-1', label: '', separator: true });

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

    if (actions.delete) {
      items.push({
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        onClick: actions.delete
      });
    }

    // Layer actions
    items.push({ id: 'separator-2', label: '', separator: true });

    if (actions.bringToFront) {
      items.push({
        id: 'bring-to-front',
        label: 'Bring to Front',
        icon: '⬆️',
        onClick: actions.bringToFront
      });
    }

    if (actions.sendToBack) {
      items.push({
        id: 'send-to-back',
        label: 'Send to Back',
        icon: '⬇️',
        onClick: actions.sendToBack
      });
    }

    // Properties
    if (actions.properties) {
      items.push({ id: 'separator-3', label: '', separator: true });
      items.push({
        id: 'properties',
        label: 'Properties',
        icon: '⚙️',
        onClick: actions.properties
      });
    }
  } else {
    // Canvas actions
    if (actions.paste) {
      items.push({
        id: 'paste',
        label: 'Paste',
        icon: '📋',
        onClick: actions.paste
      });
    }
  }

  return items;
};
