import type { Token } from '../types';
import { TokenIcon } from './TokenIcon';

interface BuildSequenceProps {
  builtTokens: Token[];
  currentStep: number;
  totalSteps: number;
  wrongTokenId: string | null;
  feedback: string;
  feedbackType: 'success' | 'error' | 'neutral';
  announcement: string;
  selectedTokenId: string | null;
  onUndo: () => void;
  onClear: () => void;
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
  onUndo,
  onClear,
  buildAreaRef,
  onBuildKeyDown,
  onBuildFocus,
  onBuildAreaTap,
}: BuildSequenceProps) {
  const isDrinkComplete = totalSteps > 0 && currentStep >= totalSteps;
  const isShiftComplete = feedback.toLowerCase().includes('shift complete');
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const feedbackClass = isShiftComplete
    ? 'shift-complete'
    : feedbackType === 'neutral'
      ? 'neutral'
      : feedbackType;

  const buildAreaLabel = selectedTokenId
    ? 'Build sequence. Click or press Enter to place selected token.'
    : 'Build sequence. Click a token in the word bank, then click here to place it.';

  return (
    <section className={`build-area panel${isDrinkComplete ? ' celebrating' : ''}`}>
      <div className="a11y-announcer" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div className="build-header">
        <div className="build-label">BUILD SEQUENCE — click tokens in order</div>
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
        className={`build-sequence${isDrinkComplete ? ' complete' : ''}${
          selectedTokenId ? ' has-selection' : ''
        }`}
        role="button"
        tabIndex={0}
        aria-label={buildAreaLabel}
        onFocus={onBuildFocus}
        onKeyDown={onBuildKeyDown}
        onClick={onBuildAreaTap}
      >
        {builtTokens.length === 0 ? (
          <span className="build-empty">
            <span className="build-empty-icon" aria-hidden="true">
              ↓
            </span>
            Click a token, then click here…
          </span>
        ) : (
          builtTokens.map((token, index) => (
            <div
              key={`${token.id}-${index}`}
              className={`build-slot${wrongTokenId === token.id ? ' wrong' : ''}${
                isDrinkComplete && index === builtTokens.length - 1 ? ' celebrate' : ''
              }`}
            >
              <TokenIcon icon={token.icon} className="build-slot-icon" /> {token.label}
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