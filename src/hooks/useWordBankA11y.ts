import { useCallback, useEffect, useRef, useState } from 'react';
import type { Token } from '../types';

const MIN_GRID_COLUMNS = 3;
const TOKEN_CELL_MIN_PX = 96;
const GRID_GAP_PX = 8;
const DRAG_THRESHOLD_PX = 10;

function computeGridColumns(containerWidth: number): number {
  if (containerWidth <= 0) return MIN_GRID_COLUMNS;
  return Math.max(MIN_GRID_COLUMNS, Math.floor((containerWidth + GRID_GAP_PX) / (TOKEN_CELL_MIN_PX + GRID_GAP_PX)));
}

type FocusZone = 'grid' | 'build';

interface TouchStart {
  x: number;
  y: number;
  tokenId: string;
}

interface UseWordBankA11yOptions {
  tokens: Token[];
  onDrop: (tokenId: string) => void;
  feedback: string;
  gameComplete?: boolean;
}

export function useWordBankA11y({
  tokens,
  onDrop,
  feedback,
  gameComplete = false,
}: UseWordBankA11yOptions) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [focusZone, setFocusZone] = useState<FocusZone>('grid');
  const [announcement, setAnnouncement] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragTokenId, setDragTokenId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);

  const [gridColumns, setGridColumns] = useState(MIN_GRID_COLUMNS);
  const tokenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const buildAreaRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<TouchStart | null>(null);
  const isDraggingRef = useRef(false);
  const tokensKey = tokens.map((t) => t.id).join(',');

  const dragToken = dragTokenId ? tokens.find((t) => t.id === dragTokenId) ?? null : null;

  useEffect(() => {
    setFocusedIndex(0);
    setSelectedTokenId(null);
    setFocusZone('grid');
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragTokenId(null);
    setDragPosition(null);
    setIsOverDropZone(false);
    touchStartRef.current = null;
  }, [tokensKey]);

  useEffect(() => {
    if (feedback) {
      setAnnouncement(feedback);
    }
  }, [feedback]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const updateColumns = () => {
      setGridColumns(computeGridColumns(grid.clientWidth));
    };

    updateColumns();

    const observer = new ResizeObserver(updateColumns);
    observer.observe(grid);
    window.addEventListener('resize', updateColumns);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateColumns);
    };
  }, [tokensKey]);

  useEffect(() => {
    if (focusZone !== 'grid' || gameComplete) return;
    tokenRefs.current[focusedIndex]?.focus();
  }, [focusedIndex, focusZone, gameComplete]);

  const isOverBuildArea = useCallback((x: number, y: number) => {
    const el = buildAreaRef.current ?? document.elementFromPoint(x, y)?.closest('.build-sequence');
    return Boolean(el);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTokenId(null);
    setAnnouncement('Selection cleared');
  }, []);

  const selectTokenAtIndex = useCallback(
    (index: number) => {
      const token = tokens[index];
      if (!token) return;

      setSelectedTokenId((prev) => {
        if (prev === token.id) {
          setAnnouncement(`${token.label} deselected`);
          return null;
        }
        setAnnouncement(`Selected ${token.label}. Press Enter in build area to place.`);
        return token.id;
      });
    },
    [tokens],
  );

  const placeSelected = useCallback(() => {
    if (!selectedTokenId || gameComplete) {
      if (!selectedTokenId) {
        setAnnouncement('No token selected. Choose a token from the word bank first.');
      }
      return;
    }

    onDrop(selectedTokenId);
    setSelectedTokenId(null);
  }, [selectedTokenId, onDrop, gameComplete]);

  const finishDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (isDraggingRef.current && dragTokenId && isOverBuildArea(clientX, clientY)) {
        onDrop(dragTokenId);
      }
      isDraggingRef.current = false;
      setIsDragging(false);
      setDragTokenId(null);
      setDragPosition(null);
      setIsOverDropZone(false);
      touchStartRef.current = null;
    },
    [dragTokenId, isOverBuildArea, onDrop],
  );

  const handleTokenTouchStart = useCallback((tokenId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, tokenId };
  }, []);

  const handleTokenTouchEnd = useCallback((tokenId: string, e: React.TouchEvent) => {
    if (isDraggingRef.current) return;

    const start = touchStartRef.current;
    if (!start || start.tokenId !== tokenId) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dist = Math.hypot(dx, dy);

    if (dist < DRAG_THRESHOLD_PX) {
      setSelectedTokenId((prev) => (prev === tokenId ? null : tokenId));
    }

    touchStartRef.current = null;
  }, []);

  const handleBuildAreaTap = useCallback(() => {
    if (selectedTokenId) {
      onDrop(selectedTokenId);
      setSelectedTokenId(null);
    }
  }, [onDrop, selectedTokenId]);

  const navigateGrid = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (tokens.length === 0) return;

      setFocusedIndex((prev) => {
        switch (direction) {
          case 'left':
            return Math.max(0, prev - 1);
          case 'right':
            return Math.min(tokens.length - 1, prev + 1);
          case 'up':
            return Math.max(0, prev - gridColumns);
          case 'down':
            return Math.min(tokens.length - 1, prev + gridColumns);
          default:
            return prev;
        }
      });
    },
    [gridColumns, tokens.length],
  );

  const handleTokenKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (gameComplete) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigateGrid('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateGrid('right');
          break;
        case 'ArrowUp':
          event.preventDefault();
          navigateGrid('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigateGrid('down');
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          selectTokenAtIndex(index);
          break;
        case 'Escape':
          event.preventDefault();
          clearSelection();
          break;
        default:
          break;
      }
    },
    [clearSelection, gameComplete, navigateGrid, selectTokenAtIndex],
  );

  const handleBuildKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (gameComplete) return;

      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          placeSelected();
          break;
        case 'Escape':
          event.preventDefault();
          clearSelection();
          break;
        default:
          break;
      }
    },
    [clearSelection, gameComplete, placeSelected],
  );

  const setTokenRef = useCallback((index: number, element: HTMLDivElement | null) => {
    tokenRefs.current[index] = element;
  }, []);

  const handleTokenFocus = useCallback((index: number) => {
    setFocusZone('grid');
    setFocusedIndex(index);
  }, []);

  const handleBuildFocus = useCallback(() => {
    setFocusZone('build');
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      const start = touchStartRef.current;
      if (!start) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const dist = Math.hypot(dx, dy);

      if (!isDraggingRef.current && dist > DRAG_THRESHOLD_PX) {
        isDraggingRef.current = true;
        setIsDragging(true);
        setDragTokenId(start.tokenId);
        setSelectedTokenId(null);
      }

      if (isDraggingRef.current) {
        e.preventDefault();
        setDragPosition({ x: touch.clientX, y: touch.clientY });
        setIsOverDropZone(isOverBuildArea(touch.clientX, touch.clientY));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      finishDrag(touch.clientX, touch.clientY);
    };

    const onTouchCancel = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      setDragTokenId(null);
      setDragPosition(null);
      setIsOverDropZone(false);
      touchStartRef.current = null;
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel);

    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [finishDrag, isDragging, isOverBuildArea]);

  useEffect(() => {
    if (!isDragging) return;

    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [isDragging]);

  useEffect(() => {
    if (gameComplete) return;

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (!selectedTokenId) return;

      event.preventDefault();
      clearSelection();
    };

    document.addEventListener('keydown', onDocumentKeyDown);
    return () => document.removeEventListener('keydown', onDocumentKeyDown);
  }, [clearSelection, gameComplete, selectedTokenId]);

  return {
    focusedIndex,
    selectedTokenId,
    focusZone,
    announcement,
    isDragging,
    dragToken,
    dragPosition,
    isOverDropZone,
    buildAreaRef,
    gridRef,
    setTokenRef,
    handleTokenKeyDown,
    handleTokenFocus,
    handleTokenTouchStart,
    handleTokenTouchEnd,
    handleBuildKeyDown,
    handleBuildFocus,
    handleBuildAreaTap,
    clearSelection,
    gridColumns,
    gridRowCount: Math.ceil(tokens.length / gridColumns) || 1,
  };
}