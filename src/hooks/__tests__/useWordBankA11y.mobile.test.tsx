// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWordBankA11y } from '../useWordBankA11y';
import type { Token } from '../../types';

const mockTokens: Token[] = [
  { id: 'espresso', label: 'Espresso', category: 'ingredient', icon: '☕' },
  { id: 'steam', label: 'Steam', category: 'action', icon: '♨' },
];

interface HarnessProps {
  tokens?: Token[];
  onDrop: (tokenId: string) => void;
  feedback?: string;
  gameComplete?: boolean;
}

function ClickHarness({
  tokens = mockTokens,
  onDrop,
  feedback = '',
  gameComplete = false,
}: HarnessProps) {
  const a11y = useWordBankA11y({ tokens, onDrop, feedback, gameComplete });

  return (
    <div>
      <div
        ref={a11y.buildAreaRef}
        className="build-sequence"
        data-testid="build-area"
        onClick={a11y.handleBuildAreaTap}
      />
      <div ref={a11y.gridRef} data-testid="token-grid">
        {tokens.map((token, index) => (
          <div
            key={token.id}
            ref={(el) => a11y.setTokenRef(index, el)}
            data-testid={`token-${token.id}`}
            onClick={() => a11y.handleTokenClick(token.id)}
          >
            {token.label}
          </div>
        ))}
      </div>
      <span data-testid="selected">{a11y.selectedTokenId ?? ''}</span>
      <span data-testid="announcement">{a11y.announcement}</span>
    </div>
  );
}

describe('useWordBankA11y click-to-place', () => {
  const onDrop = vi.fn();

  beforeEach(() => {
    onDrop.mockClear();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  it('selects a token on click', () => {
    render(<ClickHarness onDrop={onDrop} />);

    fireEvent.click(screen.getByTestId('token-espresso'));

    expect(screen.getByTestId('selected').textContent).toBe('espresso');
    expect(screen.getByTestId('announcement').textContent).toContain('Selected Espresso');
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('deselects a token when clicking the same token again', () => {
    render(<ClickHarness onDrop={onDrop} />);
    const token = screen.getByTestId('token-espresso');

    fireEvent.click(token);
    fireEvent.click(token);

    expect(screen.getByTestId('selected').textContent).toBe('');
  });

  it('places selected token when build area is clicked', () => {
    render(<ClickHarness onDrop={onDrop} />);

    fireEvent.click(screen.getByTestId('token-espresso'));
    fireEvent.click(screen.getByTestId('build-area'));

    expect(onDrop).toHaveBeenCalledWith('espresso');
    expect(screen.getByTestId('selected').textContent).toBe('');
  });

  it('does not place when build area is clicked without a selection', () => {
    render(<ClickHarness onDrop={onDrop} />);

    fireEvent.click(screen.getByTestId('build-area'));

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('switches selection when a different token is clicked', () => {
    render(<ClickHarness onDrop={onDrop} />);

    fireEvent.click(screen.getByTestId('token-espresso'));
    fireEvent.click(screen.getByTestId('token-steam'));

    expect(screen.getByTestId('selected').textContent).toBe('steam');
  });
});