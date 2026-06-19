import { useCallback, useEffect, useRef, useState } from 'react';
import type { DifficultyTier, Order, PracticeOrder, Token } from '../types';
import { SequenceEngine } from '../systems/SequenceEngine';
import { WordBankGenerator } from '../systems/WordBankGenerator';
import { OrderQueue } from '../systems/OrderQueue';
import { ScoringEngine } from '../systems/ScoringEngine';

export function useGameSession(tier: DifficultyTier, practiceOrder?: PracticeOrder) {
  const engineRef = useRef(new SequenceEngine());
  const bankGeneratorRef = useRef(new WordBankGenerator());
  const queueRef = useRef(new OrderQueue());
  const scoringRef = useRef(new ScoringEngine());
  const practiceOrderRef = useRef(practiceOrder);
  const timerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);

  practiceOrderRef.current = practiceOrder;

  const practiceKey = practiceOrder ? `${practiceOrder.drinkId}:${practiceOrder.size}` : '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderIndex, setActiveOrderIndex] = useState(0);
  const [wordBank, setWordBank] = useState<Token[]>([]);
  const [builtTokens, setBuiltTokens] = useState<Token[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'neutral'>('neutral');
  const [wrongTokenId, setWrongTokenId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [drinkStartTime, setDrinkStartTime] = useState(Date.now());
  const [gameComplete, setGameComplete] = useState(false);

  const difficulty = bankGeneratorRef.current.getDifficulty(tier);

  const loadOrder = useCallback(
    (orderList: Order[], index: number) => {
      const order = orderList[index];
      if (!order) return;

      const engine = engineRef.current;
      engine.startOrder(order.drinkId, order.size);
      const sequence = engine.getExpectedSequence();
      const bank = bankGeneratorRef.current.generate(sequence, tier);
      setWordBank(bank);
      setBuiltTokens([]);
      setTotalSteps(sequence.length);
      setFeedback('Build the drink — start with the right cup.');
      setFeedbackType('neutral');
      setWrongTokenId(null);
      setDrinkStartTime(Date.now());
    },
    [tier],
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const initSession = useCallback(() => {
    scoringRef.current.reset();
    const orderList = queueRef.current.generateQueue(tier, practiceOrderRef.current);
    setOrders(orderList);
    setActiveOrderIndex(0);
    setScore(0);
    setStreak(0);
    setSessionMistakes(0);
    setGameComplete(false);
    setTimeRemaining(difficulty.timeLimitSeconds);
    loadOrder(orderList, 0);
  }, [tier, practiceKey, difficulty.timeLimitSeconds, loadOrder]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (!difficulty.timed || gameComplete) {
      stopTimer();
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          stopTimer();
          setGameComplete(true);
          setFeedback('Time! Shift over.');
          setFeedbackType('error');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return stopTimer;
  }, [difficulty.timed, gameComplete, tier, stopTimer]);

  const handleDrop = useCallback(
    (tokenId: string) => {
      if (gameComplete) return;

      const engine = engineRef.current;
      const token = engine.getToken(tokenId);
      if (!token) return;

      const result = engine.placeToken(tokenId);

      if (result.correct) {
        setBuiltTokens((prev) => [...prev, token]);
        setFeedback(result.feedback);
        setFeedbackType('success');
        setWrongTokenId(null);

        if (result.isComplete) {
          const mistakes = engine.getMistakes();
          const timeElapsed = Date.now() - drinkStartTime;
          const points = scoringRef.current.recordDrink(
            mistakes,
            timeElapsed,
            tier,
            mistakes === 0,
          );
          setScore(scoringRef.current.getScore());
          setStreak(scoringRef.current.getStreak());
          setSessionMistakes((m) => m + mistakes);

          const nextIndex = activeOrderIndex + 1;
          if (practiceOrderRef.current) {
            setFeedback(`Nice! +${points} pts. Keep practicing.`);
            window.setTimeout(() => loadOrder(orders, activeOrderIndex), 800);
          } else if (nextIndex >= orders.length) {
            stopTimer();
            setGameComplete(true);
            setFeedback(`Shift complete! +${points} pts on last drink.`);
          } else {
            setActiveOrderIndex(nextIndex);
            window.setTimeout(() => loadOrder(orders, nextIndex), 800);
          }
        }
      } else {
        if (difficulty.penalizeWrong) {
          scoringRef.current.penalize(tier);
          setScore(scoringRef.current.getScore());
        }
        setWrongTokenId(tokenId);
        setFeedback(difficulty.hintOnWrong ? result.feedback : 'Wrong token!');
        setFeedbackType('error');
        window.setTimeout(() => setWrongTokenId(null), 400);
      }
    },
    [
      activeOrderIndex,
      difficulty.hintOnWrong,
      difficulty.penalizeWrong,
      drinkStartTime,
      gameComplete,
      loadOrder,
      orders,
      stopTimer,
      tier,
    ],
  );

  const handleUndo = useCallback(() => {
    if (gameComplete) return;

    const engine = engineRef.current;
    const result = engine.undoLastToken();
    if (!result.success) return;

    setBuiltTokens((prev) => prev.slice(0, -1));
    const nextId = engine.getExpectedSequence()[engine.getStepIndex()];
    const nextLabel = nextId ? engine.getToken(nextId)?.label : undefined;
    setFeedback(nextLabel ? `Undone. Next: ${nextLabel}` : 'Undone.');
    setFeedbackType('neutral');
    setWrongTokenId(null);
  }, [gameComplete]);

  const handleClearSequence = useCallback(() => {
    if (gameComplete) return;

    engineRef.current.clearBuiltSequence();
    setBuiltTokens([]);
    setFeedback('Sequence cleared — start again from the top.');
    setFeedbackType('neutral');
    setWrongTokenId(null);
    setDrinkStartTime(Date.now());
  }, [gameComplete]);

  return {
    difficulty,
    orders,
    activeOrderIndex,
    wordBank,
    builtTokens,
    currentStep: builtTokens.length,
    totalSteps,
    feedback,
    feedbackType,
    wrongTokenId,
    score,
    streak,
    sessionMistakes,
    timeRemaining,
    gameComplete,
    handleDrop,
    handleUndo,
    handleClearSequence,
    restart: initSession,
  };
}