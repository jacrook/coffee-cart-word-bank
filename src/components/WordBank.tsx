import type { Token } from '../types';
import { TokenTile } from './TokenTile';

interface WordBankProps {
  tokens: Token[];
  focusedIndex: number;
  selectedTokenId: string | null;
  gridColumns: number;
  gridRowCount: number;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onTokenKeyDown: (event: React.KeyboardEvent, index: number) => void;
  onTokenFocus: (index: number) => void;
  onTokenTouchStart: (tokenId: string, event: React.TouchEvent) => void;
  onTokenTouchEnd: (tokenId: string, event: React.TouchEvent) => void;
  setTokenRef: (index: number, element: HTMLDivElement | null) => void;
}

export function WordBank({
  tokens,
  focusedIndex,
  selectedTokenId,
  gridColumns,
  gridRowCount,
  gridRef,
  onTokenKeyDown,
  onTokenFocus,
  onTokenTouchStart,
  onTokenTouchEnd,
  setTokenRef,
}: WordBankProps) {
  return (
    <section className="word-bank panel" aria-label="Word bank">
      <div className="panel-header">
        <span className="word-bank-title">📦 WORD BANK</span>
        <span className="word-bank-count">{tokens.length} items</span>
      </div>
      <p className="word-bank-hint" id="word-bank-instructions">
        Drag tokens up to the build sequence, or use arrow keys to navigate and Enter/Space to
        select
      </p>
      <div className="token-grid-scroll">
      <div
        ref={gridRef}
        className="token-grid"
        role="grid"
        aria-colcount={gridColumns}
        aria-rowcount={gridRowCount}
        aria-describedby="word-bank-instructions"
      >
        {tokens.map((token, index) => (
          <TokenTile
            key={`${token.id}-${index}`}
            token={token}
            tabIndex={index === focusedIndex ? 0 : -1}
            isSelected={selectedTokenId === token.id}
            onKeyDown={(event) => onTokenKeyDown(event, index)}
            onFocus={() => onTokenFocus(index)}
            onTouchStart={(event) => onTokenTouchStart(token.id, event)}
            onTouchEnd={(event) => onTokenTouchEnd(token.id, event)}
            tokenRef={(element) => setTokenRef(index, element)}
          />
        ))}
      </div>
      </div>
    </section>
  );
}