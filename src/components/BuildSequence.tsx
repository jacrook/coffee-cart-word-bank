import { useState } from 'react';
import type { Token } from '../types';

interface BuildSequenceProps {
  builtTokens: Token[];
  currentStep: number;
  totalSteps: number;
  wrongTokenId: string | null;
  feedback: string;
  feedbackType: 'success' | 'error' | 'neutral';
  announcement: string;
  selectedTokenId: string | null;
  onDrop: (tokenId: string) => void;
  onUndo: () => void;
  onClear: () => void;
  isOverDropZone?: boolean;
  buildAreaRef: React.RefObject<HTMLDivElement | null>;
  onBuildKeyDown: (event: React.KeyboardEvent) => void;
  onBuildFocus: () => void;
  onBuildAreaTap?: () => void;
}

export function BuildSequence({
  builtTokens,
  currentStep,
  totalSteps,
  wrongTokenId,
  feedback,
  feedbackType,
  announcement,
  selectedTokenId,
  onDrop,
  onUndo,
  onClear,
  isOverDropZone = false,
  buildAreaRef,
  onBuildKeyDown,
  onBuildFocus,
  onBuildAreaTap,
}: BuildSequenceProps) {
  const [htmlDragOver, setHtmlDragOver] = useState(false);
  const dragOver = htmlDragOver || isOverDropZone;

  const isDrinkComplete = totalSteps > 0 && currentStep >= totalSteps;
  const isShiftComplete = feedback.toLowerCase().includes('shift complete');
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const feedbackClass = isShiftComplete
    ? 'shift-complete'
    : feedbackType === 'neutral'
      ? 'neutral'
      : feedbackType;

  const buildAreaLabel = selectedTokenId
    ? 'Build sequence. Press Enter to place selected token.'
    : 'Build sequence. Select a token from the word bank, then press Enter here to place it.';

  return (
    <section className={`build-area panel${isDrinkComplete ? ' celebrating' : ''}`}>
      <div className="a11y-announcer" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div className="build-header">
        <div className="build-label">BUILD SEQUENCE — drag tokens here in order</div>
        {totalSteps > 0 && (
          <div className="step-progress" aria-hidden="true">
            <span className="step-progress-text">
              {currentStep}/{totalSteps} STEPS
            </span>
            <div className="step-progress-bar">
              <div
                className={`step-progress-fill${isDrinkComplete ? ' complete' : ''}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div
        ref={buildAreaRef}
        className={`build-sequence${dragOver ? ' drag-over' : ''}${
          isDrinkComplete ? ' complete' : ''
        }${selectedTokenId ? ' has-selection' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={buildAreaLabel}
        onFocus={onBuildFocus}
        onKeyDown={onBuildKeyDown}
        onClick={onBuildAreaTap}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          setHtmlDragOver(true);
        }}
        onDragLeave={() => setHtmlDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHtmlDragOver(false);
          const tokenId = e.dataTransfer.getData('text/plain');
          if (tokenId) onDrop(tokenId);
        }}
      >
        {builtTokens.length === 0 ? (
          <span className="build-empty">
            <span className="build-empty-icon" aria-hidden="true">
              ↓
            </span>
            Drop your first token here…
          </span>
        ) : (
          builtTokens.map((token, index) => (
            <div
              key={`${token.id}-${index}`}
              className={`build-slot${wrongTokenId === token.id ? ' wrong' : ''}${
                isDrinkComplete && index === builtTokens.length - 1 ? ' celebrate' : ''
              }`}
            >
              <span aria-hidden="true">{token.icon}</span> {token.label}
            </div>
          ))
        )}
      </div>

      <div className="build-actions">
        <button
          type="button"
          className="build-action-btn"
          onClick={onUndo}
          disabled={builtTokens.length === 0}
        >
          ↩ UNDO
        </button>
        <button
          type="button"
          className="build-action-btn build-action-btn--clear"
          onClick={onClear}
          disabled={builtTokens.length === 0}
        >
          ✕ CLEAR
        </button>
      </div>

      {feedback && (
        <div className={`feedback ${feedbackClass}`} aria-hidden="true">
          {feedback}
        </div>
      )}
    </section>
  );
}