import { useRef, useState } from 'react';
import type { Token } from '../types';

interface TokenTileProps {
  token: Token;
  tabIndex?: number;
  isSelected?: boolean;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
  tokenRef?: (element: HTMLDivElement | null) => void;
}

export function TokenTile({
  token,
  tabIndex = -1,
  isSelected = false,
  onKeyDown,
  onFocus,
  onTouchStart,
  onTouchEnd,
  tokenRef,
}: TokenTileProps) {
  const [dragging, setDragging] = useState(false);
  const pointerTypeRef = useRef<string>('mouse');

  return (
    <div
      ref={tokenRef}
      className={`token token--${token.category}${dragging ? ' dragging' : ''}${
        isSelected ? ' token--selected' : ''
      }`}
      role="gridcell"
      tabIndex={tabIndex}
      aria-selected={isSelected}
      aria-label={token.label}
      draggable
      onPointerDown={(e) => {
        pointerTypeRef.current = e.pointerType;
      }}
      onDragStart={(e) => {
        if (pointerTypeRef.current === 'touch') {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/plain', token.id);
        e.dataTransfer.effectAllowed = 'move';
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    >
      <span className="token-icon" aria-hidden="true">
        {token.icon ?? '•'}
      </span>
      <span className="token-label">{token.label}</span>
    </div>
  );
}