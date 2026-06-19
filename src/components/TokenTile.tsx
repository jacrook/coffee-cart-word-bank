import type { Token } from '../types';

interface TokenTileProps {
  token: Token;
  tabIndex?: number;
  isSelected?: boolean;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onClick?: () => void;
  tokenRef?: (element: HTMLDivElement | null) => void;
}

export function TokenTile({
  token,
  tabIndex = -1,
  isSelected = false,
  onKeyDown,
  onFocus,
  onClick,
  tokenRef,
}: TokenTileProps) {
  return (
    <div
      ref={tokenRef}
      className={`token token--${token.category}${isSelected ? ' token--selected' : ''}`}
      role="gridcell"
      tabIndex={tabIndex}
      aria-selected={isSelected}
      aria-label={token.label}
      onClick={onClick}
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