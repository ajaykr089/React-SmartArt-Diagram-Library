import React, { useEffect, useCallback, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export interface UseKeyboardOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
  target?: HTMLElement | Window;
}

export const useKeyboard = (options: UseKeyboardOptions) => {
  const { enabled = true, shortcuts, target } = options;
  const [isClient, setIsClient] = useState(false);

  // Handle SSR - window is not available during server-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultTarget = isClient ? window : undefined;
  const actualTarget = target || defaultTarget;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const { key, ctrlKey, shiftKey, altKey, metaKey } = event;

    // Find matching shortcut
    const shortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrl === ctrlKey;
      const shiftMatches = !!shortcut.shift === shiftKey;
      const altMatches = !!shortcut.alt === altKey;
      const metaMatches = !!shortcut.meta === metaKey;

      return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
    });

    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      shortcut.action();
    }
  }, [enabled, shortcuts]);

  useEffect(() => {
    if (!enabled || !actualTarget) return;

    const handleEvent = (event: Event) => {
      handleKeyDown(event as KeyboardEvent);
    };

    actualTarget.addEventListener('keydown', handleEvent);

    return () => {
      actualTarget.removeEventListener('keydown', handleEvent);
    };
  }, [enabled, handleKeyDown, actualTarget]);

  // Return utility functions
  const isShortcutPressed = useCallback((shortcut: Omit<KeyboardShortcut, 'action' | 'description'>) => {
    // This is a helper for checking if a shortcut combination is currently pressed
    // Implementation would require tracking key states
    return false;
  }, []);

  return {
    isShortcutPressed
  };
};

// Predefined keyboard shortcuts for common diagram operations
export const createDiagramShortcuts = (
  actions: {
    undo?: () => void;
    redo?: () => void;
    delete?: () => void;
    copy?: () => void;
    paste?: () => void;
    selectAll?: () => void;
    zoomIn?: () => void;
    zoomOut?: () => void;
    resetZoom?: () => void;
    addNode?: () => void;
    addEdge?: () => void;
    save?: () => void;
    open?: () => void;
  }
): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  // Undo/Redo
  if (actions.undo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      action: actions.undo,
      description: 'Undo last action'
    });
  }

  if (actions.redo) {
    shortcuts.push({
      key: 'y',
      ctrl: true,
      action: actions.redo,
      description: 'Redo last undone action'
    }, {
      key: 'z',
      ctrl: true,
      shift: true,
      action: actions.redo,
      description: 'Redo last undone action'
    });
  }

  // Delete
  if (actions.delete) {
    shortcuts.push({
      key: 'Delete',
      action: actions.delete,
      description: 'Delete selected items'
    }, {
      key: 'Backspace',
      action: actions.delete,
      description: 'Delete selected items'
    });
  }

  // Copy/Paste
  if (actions.copy) {
    shortcuts.push({
      key: 'c',
      ctrl: true,
      action: actions.copy,
      description: 'Copy selected items'
    });
  }

  if (actions.paste) {
    shortcuts.push({
      key: 'v',
      ctrl: true,
      action: actions.paste,
      description: 'Paste items'
    });
  }

  // Select All
  if (actions.selectAll) {
    shortcuts.push({
      key: 'a',
      ctrl: true,
      action: actions.selectAll,
      description: 'Select all items'
    });
  }

  // Zoom controls
  if (actions.zoomIn) {
    shortcuts.push({
      key: '+',
      ctrl: true,
      action: actions.zoomIn,
      description: 'Zoom in'
    }, {
      key: '=',
      ctrl: true,
      action: actions.zoomIn,
      description: 'Zoom in'
    });
  }

  if (actions.zoomOut) {
    shortcuts.push({
      key: '-',
      ctrl: true,
      action: actions.zoomOut,
      description: 'Zoom out'
    });
  }

  if (actions.resetZoom) {
    shortcuts.push({
      key: '0',
      ctrl: true,
      action: actions.resetZoom,
      description: 'Reset zoom to 100%'
    });
  }

  // Quick actions
  if (actions.addNode) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      action: actions.addNode,
      description: 'Add new node'
    });
  }

  if (actions.addEdge) {
    shortcuts.push({
      key: 'e',
      ctrl: true,
      action: actions.addEdge,
      description: 'Add new edge'
    });
  }

  // File operations
  if (actions.save) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      action: actions.save,
      description: 'Save diagram'
    });
  }

  if (actions.open) {
    shortcuts.push({
      key: 'o',
      ctrl: true,
      action: actions.open,
      description: 'Open diagram'
    });
  }

  return shortcuts;
};

// Keyboard shortcut display component
export const KeyboardShortcutsHelp = ({
  shortcuts,
  title = 'Keyboard Shortcuts'
}: {
  shortcuts: KeyboardShortcut[];
  title?: string;
}) => {
  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.meta) parts.push('Cmd');

    parts.push(shortcut.key.toUpperCase());

    return parts.join(' + ');
  };

  return React.createElement('div', { style: { padding: '16px', maxWidth: '400px' } },
    React.createElement('h4', { style: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' } }, title),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      shortcuts.map((shortcut, index) =>
        React.createElement('div', {
          key: index,
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5'
          }
        },
          React.createElement('span', { style: { fontSize: '14px', fontWeight: '500' } }, shortcut.description),
          React.createElement('kbd', {
            style: {
              padding: '2px 6px',
              backgroundColor: '#ffffff',
              border: '1px solid #cccccc',
              borderRadius: '3px',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }
          }, formatShortcut(shortcut))
        )
      )
    )
  );
};
