import type { DifficultyConfig } from '../types';

interface GameHUDProps {
  score: number;
  streak: number;
  mistakes: number;
  difficulty: DifficultyConfig;
  timeRemaining?: number;
  timeLimit?: number;
}

export function GameHUD({ score, streak, mistakes, difficulty, timeRemaining, timeLimit }: GameHUDProps) {
  const timerPercent =
    timeLimit && timeRemaining !== undefined ? (timeRemaining / timeLimit) * 100 : 100;

  return (
    <header className="hud">
      <div className="hud-stat">
        <span className="hud-label">SCORE</span>
        <span className="hud-value">{score}</span>
      </div>
      <div className="hud-stat">
        <span className="hud-label">STREAK</span>
        <span className="hud-value">{streak}</span>
      </div>
      <div className="hud-stat">
        <span className="hud-label">MISTAKES</span>
        <span className="hud-value">{mistakes}</span>
      </div>
      <div className="hud-stat">
        <span className="hud-label">MODE</span>
        <span className="hud-value hud-value--mode">{difficulty.label}</span>
      </div>
      {difficulty.timed && timeRemaining !== undefined && (
        <div className="hud-stat hud-stat--wide">
          <span className="hud-label">TIME</span>
          <span className="hud-value">{timeRemaining}s</span>
          <div className="timer-bar">
            <div
              className={`timer-fill${timeRemaining <= 20 ? ' warning' : ''}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}