import { useState, useCallback, useRef } from 'react';
import { SmartDiagramData } from '../types/diagram';

interface HistoryState {
  past: SmartDiagramData[];
  present: SmartDiagramData;
  future: SmartDiagramData[];
}

export const useUndoRedo = (initialData: SmartDiagramData) => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialData,
    future: []
  });

  const skipRecording = useRef(false);

  const recordChange = useCallback((newData: SmartDiagramData) => {
    if (skipRecording.current) {
      skipRecording.current = false;
      return;
    }

    setHistory(prevHistory => ({
      past: [...prevHistory.past, prevHistory.present],
      present: newData,
      future: []
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.past.length === 0) return prevHistory;

      const previous = prevHistory.past[prevHistory.past.length - 1];
      const newPast = prevHistory.past.slice(0, -1);

      skipRecording.current = true;

      return {
        past: newPast,
        present: previous,
        future: [prevHistory.present, ...prevHistory.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.future.length === 0) return prevHistory;

      const next = prevHistory.future[0];
      const newFuture = prevHistory.future.slice(1);

      skipRecording.current = true;

      return {
        past: [...prevHistory.past, prevHistory.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const reset = useCallback((newData: SmartDiagramData = initialData) => {
    setHistory({
      past: [],
      present: newData,
      future: []
    });
  }, [initialData]);

  return {
    currentData: history.present,
    recordChange,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historySize: {
      past: history.past.length,
      future: history.future.length
    }
  };
};
