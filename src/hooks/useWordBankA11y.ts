import { useCallback, useEffect, useRef, useState } from 'react';
import type { Token } from '../types';
import { computeGridColumns } from '../styles/layoutTokens';

type FocusZone = 'grid' | 'build';

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

  const [gridColumns, setGridColumns] = useState(3);
  const tokenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const buildAreaRef = useRef<HTMLDivElement | null>(null);
  const tokensKey = tokens.map((t) => t.id).join(',');

  useEffect(() => {
    setFocusedIndex(0);
    setSelectedTokenId(null);
    setFocusZone('grid');
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
      setGridColumns(computeGridColumns(grid.clientWidth, window.innerWidth));
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

  const clearSelection = useCallback(() => {
    setSelectedTokenId(null);
    setAnnouncement('Selection cleared');
  }, []);

  const toggleTokenSelection = useCallback(
    (tokenId: string) => {
      if (gameComplete) return;

      const token = tokens.find((t) => t.id === tokenId);
      if (!token) return;

      setSelectedTokenId((prev) => {
        if (prev === tokenId) {
          setAnnouncement(`${token.label} deselected`);
          return null;
        }
        setAnnouncement(`Selected ${token.label}. Click the build area to place.`);
        return tokenId;
      });
    },
    [gameComplete, tokens],
  );

  const selectTokenAtIndex = useCallback(
    (index: number) => {
      const token = tokens[index];
      if (!token) return;
      toggleTokenSelection(token.id);
    },
    [tokens, toggleTokenSelection],
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

  const handleTokenClick = useCallback(
    (tokenId: string) => {
      toggleTokenSelection(tokenId);
    },
    [toggleTokenSelection],
  );

  const handleBuildAreaTap = useCallback(() => {
    placeSelected();
  }, [placeSelected]);

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
        case ' ':
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
    buildAreaRef,
    gridRef,
    setTokenRef,
    handleTokenKeyDown,
    handleTokenFocus,
    handleTokenClick,
    handleBuildKeyDown,
    handleBuildFocus,
    handleBuildAreaTap,
    clearSelection,
    gridColumns,
    gridRowCount: Math.ceil(tokens.length / gridColumns) || 1,
  };
}