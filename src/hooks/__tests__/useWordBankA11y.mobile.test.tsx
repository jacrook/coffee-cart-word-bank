// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWordBankA11y } from '../useWordBankA11y';
import type { Token } from '../../types';

const mockTokens: Token[] = [
  { id: 'espresso', label: 'Espresso', category: 'ingredient', icon: '☕' },
  { id: 'steam', label: 'Steam', category: 'action', icon: '♨' },
];

function createTouch(target: Element, x: number, y: number, identifier = 0) {
  return {
    identifier,
    target,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  };
}

interface HarnessProps {
  tokens?: Token[];
  onDrop: (tokenId: string) => void;
  feedback?: string;
  gameComplete?: boolean;
}

function TouchHarness({
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
            onTouchStart={(e) => a11y.handleTokenTouchStart(token.id, e)}
            onTouchEnd={(e) => a11y.handleTokenTouchEnd(token.id, e)}
          >
            {token.label}
          </div>
        ))}
      </div>
      <span data-testid="selected">{a11y.selectedTokenId ?? ''}</span>
      <span data-testid="dragging">{a11y.isDragging ? 'yes' : 'no'}</span>
      <span data-testid="drag-token">{a11y.dragToken?.id ?? ''}</span>
      <span data-testid="over-drop">{a11y.isOverDropZone ? 'yes' : 'no'}</span>
    </div>
  );
}

function mockBuildAreaRect(left: number, top: number, width: number, height: number) {
  const buildArea = screen.getByTestId('build-area');
  buildArea.getBoundingClientRect = () =>
    ({
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height,
      x: left,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
}

describe('useWordBankA11y mobile touch', () => {
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

  describe('tap-to-select', () => {
    it('selects a token on short tap without movement', () => {
      render(<TouchHarness onDrop={onDrop} />);
      const token = screen.getByTestId('token-espresso');

      fireEvent.touchStart(token, {
        touches: [createTouch(token, 50, 50)],
      });
      fireEvent.touchEnd(token, {
        changedTouches: [createTouch(token, 50, 50)],
      });

      expect(screen.getByTestId('selected').textContent).toBe('espresso');
      expect(onDrop).not.toHaveBeenCalled();
    });

    it('deselects a token when tapping the same token again', () => {
      render(<TouchHarness onDrop={onDrop} />);
      const token = screen.getByTestId('token-espresso');

      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });
      fireEvent.touchEnd(token, { changedTouches: [createTouch(token, 50, 50)] });
      expect(screen.getByTestId('selected').textContent).toBe('espresso');

      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });
      fireEvent.touchEnd(token, { changedTouches: [createTouch(token, 50, 50)] });
      expect(screen.getByTestId('selected').textContent).toBe('');
    });

    it('does not select when movement exceeds tap threshold', () => {
      render(<TouchHarness onDrop={onDrop} />);
      const token = screen.getByTestId('token-espresso');

      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });

      act(() => {
        fireEvent.touchMove(document, {
          touches: [createTouch(token, 80, 50)],
        });
      });

      expect(screen.getByTestId('selected').textContent).toBe('');
      expect(screen.getByTestId('dragging').textContent).toBe('yes');

      // touchend bubbles to document listener and finishes the drag
      fireEvent.touchEnd(token, { changedTouches: [createTouch(token, 80, 50)] });

      expect(screen.getByTestId('selected').textContent).toBe('');
      expect(onDrop).not.toHaveBeenCalled();
      expect(screen.getByTestId('dragging').textContent).toBe('no');
    });
  });

  describe('tap-to-place', () => {
    it('places selected token when build area is tapped', () => {
      render(<TouchHarness onDrop={onDrop} />);
      const token = screen.getByTestId('token-espresso');
      const buildArea = screen.getByTestId('build-area');

      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });
      fireEvent.touchEnd(token, { changedTouches: [createTouch(token, 50, 50)] });
      expect(screen.getByTestId('selected').textContent).toBe('espresso');

      fireEvent.click(buildArea);

      expect(onDrop).toHaveBeenCalledWith('espresso');
      expect(screen.getByTestId('selected').textContent).toBe('');
    });
  });

  describe('touch drag', () => {
    it('starts dragging after crossing movement threshold', () => {
      render(<TouchHarness onDrop={onDrop} />);
      const token = screen.getByTestId('token-espresso');

      fireEvent.touchStart(token, { touches: [createTouch(token, 100, 100)] });

      act(() => {
        fireEvent.touchMove(document, {
          touches: [createTouch(token, 100, 100)],
        });
      });
      expect(screen.getByTestId('dragging').textContent).toBe('no');

      act(() => {
        fireEvent.touchMove(document, {
          touches: [createTouch(token, 115, 100)],
        });
      });

      expect(screen.getByTestId('dragging').textContent).toBe('yes');
      expect(screen.getByTestId('drag-token').textContent).toBe('espresso');
    });

    it('sets isOverDropZone when drag position is over build area', () => {
      render(<TouchHarness onDrop={onDrop} />);
      mockBuildAreaRect(200, 50, 100, 80);

      const token = screen.getByTestId('token-espresso');
      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });

      act(() => {
        fireEvent.touchMove(document, {
          touches: [createTouch(token, 250, 80)],
        });
      });

      expect(screen.getByTestId('dragging').textContent).toBe('yes');
      expect(screen.getByTestId('over-drop').textContent).toBe('yes');
    });

    it('does not set isOverDropZone when drag position is outside build area', () => {
      render(<TouchHarness onDrop={onDrop} />);
      mockBuildAreaRect(200, 50, 100, 80);

      const token = screen.getByTestId('token-espresso');
      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });

      act(() => {
        fireEvent.touchMove(document, {
          touches: [createTouch(token, 50, 200)],
        });
      });

      expect(screen.getByTestId('dragging').textContent).toBe('yes');
      expect(screen.getByTestId('over-drop').textContent).toBe('no');
    });

    it('drops token on touchend when released over build area', () => {
      render(<TouchHarness onDrop={onDrop} />);
      mockBuildAreaRect(200, 50, 100, 80);

      const token = screen.getByTestId('token-espresso');
      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });

      act(() => {
        fireEvent.touchMove(document, {
          touches: [createTouch(token, 250, 80)],
        });
      });

      act(() => {
        fireEvent.touchEnd(document, {
          changedTouches: [createTouch(token, 250, 80)],
        });
      });

      expect(onDrop).toHaveBeenCalledWith('espresso');
      expect(screen.getByTestId('dragging').textContent).toBe('no');
    });

    it('does not drop token when released outside build area', () => {
      render(<TouchHarness onDrop={onDrop} />);
      mockBuildAreaRect(200, 50, 100, 80);

      const token = screen.getByTestId('token-espresso');
      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });

      act(() => {
        fireEvent.touchMove(document, {
          touches: [createTouch(token, 50, 200)],
        });
      });

      act(() => {
        fireEvent.touchEnd(document, {
          changedTouches: [createTouch(token, 50, 200)],
        });
      });

      expect(onDrop).not.toHaveBeenCalled();
      expect(screen.getByTestId('dragging').textContent).toBe('no');
    });

    it('clears pending touch state on touchcancel before drag threshold', () => {
      render(<TouchHarness onDrop={onDrop} />);
      const token = screen.getByTestId('token-espresso');

      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });

      act(() => {
        fireEvent.touchCancel(document);
      });

      act(() => {
        fireEvent.touchMove(document, {
          touches: [createTouch(token, 80, 50)],
        });
      });

      expect(screen.getByTestId('dragging').textContent).toBe('no');
    });

    it('clears selection when drag starts', () => {
      render(<TouchHarness onDrop={onDrop} />);
      const token = screen.getByTestId('token-espresso');

      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });
      fireEvent.touchEnd(token, { changedTouches: [createTouch(token, 50, 50)] });
      expect(screen.getByTestId('selected').textContent).toBe('espresso');

      fireEvent.touchStart(token, { touches: [createTouch(token, 50, 50)] });
      act(() => {
        fireEvent.touchMove(document, {
          touches: [createTouch(token, 80, 50)],
        });
      });

      expect(screen.getByTestId('selected').textContent).toBe('');
    });
  });
});