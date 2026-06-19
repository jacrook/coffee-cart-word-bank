import { useState } from 'react'
import type { DifficultyTier, PracticeOrder } from './types';
import { DifficultySelect } from './components/DifficultySelect';
import { GameHUD } from './components/GameHUD';
import { OrderPanel } from './components/OrderPanel';
import { BuildSequence } from './components/BuildSequence';
import { WordBank } from './components/WordBank';
import { useGameSession } from './hooks/useGameSession';
import { useWordBankA11y } from './hooks/useWordBankA11y';
import './styles/pixel.css';

interface SessionConfig {
  tier: DifficultyTier;
  practiceOrder?: PracticeOrder;
}

function GameScreen({ config, onQuit }: { config: SessionConfig; onQuit: () => void }) {
  const session = useGameSession(config.tier, config.practiceOrder);
  const a11y = useWordBankA11y({
    tokens: session.wordBank,
    onDrop: session.handleDrop,
    feedback: session.feedback,
    gameComplete: session.gameComplete,
  });

  return (
    <div className="game-shell">
      <GameHUD
        score={session.score}
        streak={session.streak}
        mistakes={session.sessionMistakes}
        difficulty={session.difficulty}
        timeRemaining={session.timeRemaining}
        timeLimit={session.difficulty.timeLimitSeconds}
      />

      <div className="game-main">
        <div className="game-sidebar">
          <OrderPanel orders={session.orders} activeOrderIndex={session.activeOrderIndex} />

          <BuildSequence
            builtTokens={session.builtTokens}
            currentStep={session.currentStep}
            totalSteps={session.totalSteps}
            wrongTokenId={session.wrongTokenId}
            feedback={session.feedback}
            feedbackType={session.feedbackType}
            announcement={a11y.announcement}
            selectedTokenId={a11y.selectedTokenId}
            onDrop={session.handleDrop}
            onUndo={session.handleUndo}
            onClear={session.handleClearSequence}
            isOverDropZone={a11y.isOverDropZone}
            buildAreaRef={a11y.buildAreaRef}
            onBuildKeyDown={a11y.handleBuildKeyDown}
            onBuildFocus={a11y.handleBuildFocus}
            onBuildAreaTap={a11y.handleBuildAreaTap}
          />
        </div>

        <WordBank
          tokens={session.wordBank}
          focusedIndex={a11y.focusedIndex}
          selectedTokenId={a11y.selectedTokenId}
          gridColumns={a11y.gridColumns}
          gridRowCount={a11y.gridRowCount}
          gridRef={a11y.gridRef}
          onTokenKeyDown={a11y.handleTokenKeyDown}
          onTokenFocus={a11y.handleTokenFocus}
          onTokenTouchStart={a11y.handleTokenTouchStart}
          onTokenTouchEnd={a11y.handleTokenTouchEnd}
          setTokenRef={a11y.setTokenRef}
        />
      </div>

      {a11y.isDragging && a11y.dragToken && a11y.dragPosition && (
        <div
          className={`touch-drag-ghost token token--${a11y.dragToken.category}`}
          style={{
            left: a11y.dragPosition.x,
            top: a11y.dragPosition.y,
          }}
          aria-hidden="true"
        >
          <span className="token-icon">{a11y.dragToken.icon ?? '•'}</span>
          <span className="token-label">{a11y.dragToken.label}</span>
        </div>
      )}

      <footer className="game-footer">
        {session.gameComplete && (
          <button className="difficulty-btn difficulty-btn--success" onClick={session.restart}>
            PLAY AGAIN
          </button>
        )}
        <button className="difficulty-btn difficulty-btn--secondary" onClick={onQuit}>
          CHANGE MODE
        </button>
      </footer>
    </div>
  );
}

export default function App() {
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);

  if (!sessionConfig) {
    return (
      <div className="game-shell">
        <DifficultySelect onSelect={(tier, practiceOrder) => setSessionConfig({ tier, practiceOrder })} />
      </div>
    );
  }

  return <GameScreen config={sessionConfig} onQuit={() => setSessionConfig(null)} />;
}