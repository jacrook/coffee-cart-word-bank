import { useState } from 'react';
import type { DifficultyTier, PracticeOrder } from '../types';
import difficultyData from '../data/difficulty.json';
import { getPracticeOptions, getPracticeLabel } from '../utils/menu';

interface DifficultySelectProps {
  onSelect: (tier: DifficultyTier, practiceOrder?: PracticeOrder) => void;
}

const TIERS: DifficultyTier[] = ['rookie', 'shift_lead', 'master'];

const DESCRIPTIONS: Record<DifficultyTier, string> = {
  rookie: '10 items · ingredients only · hints on mistakes',
  shift_lead: 'Full station · all cups & ingredients · wrong picks cost score',
  master: '50+ items · timed · 3-drink queue',
};

const practiceOptions = getPracticeOptions();

export function DifficultySelect({ onSelect }: DifficultySelectProps) {
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<PracticeOrder>(practiceOptions[0]);

  const start = (tier: DifficultyTier) => {
    onSelect(tier, practiceMode ? selectedPractice : undefined);
  };

  return (
    <div className="difficulty-screen">
      <div className="game-title-wrap">
        <div className="game-logo">☕</div>
        <h1 className="game-title">
          COFFEE <span className="game-title-accent">CART</span>
          <br />
          CHRONICLES
        </h1>
        <p className="game-subtitle">Shared word bank barista trainer · 15 drinks · 34 station tokens</p>
      </div>

      <div className="practice-panel panel">
        <label className="practice-toggle">
          <input
            type="checkbox"
            checked={practiceMode}
            onChange={(e) => setPracticeMode(e.target.checked)}
          />
          <span>Practice Mode — pick a specific drink</span>
        </label>
        {practiceMode && (
          <select
            className="practice-select"
            value={`${selectedPractice.drinkId}:${selectedPractice.size}`}
            onChange={(e) => {
              const [drinkId, size] = e.target.value.split(':');
              setSelectedPractice({ drinkId, size });
            }}
          >
            {practiceOptions.map((option) => (
              <option key={`${option.drinkId}:${option.size}`} value={`${option.drinkId}:${option.size}`}>
                {getPracticeLabel(option)}
              </option>
            ))}
          </select>
        )}
      </div>

      {TIERS.map((tier) => {
        const config = difficultyData[tier];
        return (
          <button key={tier} className="difficulty-btn" onClick={() => start(tier)}>
            <span className="difficulty-btn-label">{config.label}</span>
            <span className="difficulty-desc">{DESCRIPTIONS[tier]}</span>
          </button>
        );
      })}
    </div>
  );
}