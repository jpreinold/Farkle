// components/Game.tsx
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import CustomButton from './CustomButton';
import { ThemeContext } from './ThemeContext';
import storage from '../utils/storage';
import CompactPlayerScoreboard from './CompactPlayerScoreboard';
import TurnScoreDisplay from './TurnScoreDisplay';
import DiceGameCanvas from './DiceGameCanvas';
import GameActionButtons from './GameActionButtons';
import GameOverModal from './GameOverModal';
import {
  canScore,
  analyzeRoll,
  ScoringGroup,
} from '../utils/farkleScoring';

interface ScoreEntry {
  id: number;
  player: string;
  score: number;
  note: string;
}

const Game: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<string[]>([]);
  const [targetScore, setTargetScore] = useState(10000);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');

  const [availableDice, setAvailableDice] = useState(6);
  const [currentRoll, setCurrentRoll] = useState<number[]>([]);
  const [scoringGroups, setScoringGroups] = useState<ScoringGroup[]>([]);
  const [indexGroupMap, setIndexGroupMap] = useState<Record<number, string[]>>({});
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [turnScore, setTurnScore] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [farkleOccurred, setFarkleOccurred] = useState(false);

  const currentPlayer = players[currentPlayerIndex] || '';

  const resetTurnState = useCallback(() => {
    setAvailableDice(6);
    setCurrentRoll([]);
    setSelectedGroupIds([]);
    setScoringGroups([]);
    setIndexGroupMap({});
    setTurnScore(0);
    setIsRolling(false);
    setHasRolled(false);
    setFarkleOccurred(false);
  }, []);

  useEffect(() => {
    const loadSimulation = async () => {
      try {
        const config = await storage.getItem('GAME_CONFIG_SIMULATION');
        if (!config) {
          navigate('/game-setup');
          return;
        }
        const parsedConfig = JSON.parse(config);
        if (!parsedConfig.players || parsedConfig.players.length === 0) {
          navigate('/game-setup');
          return;
        }
        setPlayers(parsedConfig.players);
        setTargetScore(parsedConfig.targetScore || 10000);

        const savedState = await storage.getItem('GAME_STATE_SIMULATION');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setScores(parsedState.scores || []);
          setCurrentPlayerIndex(parsedState.currentPlayerIndex || 0);
          setGameOver(parsedState.gameOver || false);
          setWinner(parsedState.winner || '');
        }
      } catch (error) {
        console.error('Error loading simulation game state:', error);
        navigate('/game-setup');
      } finally {
        setLoading(false);
      }
    };

    loadSimulation();
  }, [navigate]);

  useEffect(() => {
    if (players.length === 0) return;
    const saveState = async () => {
      try {
        const state = {
          scores,
          currentPlayerIndex,
          gameOver,
          winner,
        };
        await storage.setItem('GAME_STATE_SIMULATION', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving simulation game state:', error);
      }
    };
    saveState();
  }, [scores, currentPlayerIndex, gameOver, winner, players.length]);

  const playerTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    players.forEach((player) => {
      totals[player] = 0;
    });
    scores.forEach((entry) => {
      totals[entry.player] = (totals[entry.player] || 0) + entry.score;
    });
    return totals;
  }, [players, scores]);

  useEffect(() => {
    if (players.length === 0) return;
    for (const player of players) {
      if ((playerTotals[player] || 0) >= targetScore) {
        setGameOver(true);
        setWinner(player);
        return;
      }
    }
    setGameOver(false);
    setWinner('');
  }, [players, playerTotals, targetScore]);

  const rollDiceValues = useCallback((count: number): number[] => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  }, []);

  const pendingGroupIdsRef = useRef<string[]>([]);
  const pendingScoreRef = useRef(0);

  const executeRoll = useCallback((count: number) => {
    setIsRolling(true);
    setSelectedGroupIds([]);
    setFarkleOccurred(false);
    const newRoll = rollDiceValues(count);
    setCurrentRoll(newRoll);
    const analysis = analyzeRoll(newRoll);
    setScoringGroups(analysis.groups);
    setIndexGroupMap(analysis.indexToGroupIds);
    pendingGroupIdsRef.current = analysis.bestGroupIds;
    pendingScoreRef.current = analysis.bestScore;
    setHasRolled(true);
    setTimeout(() => {
      setIsRolling(false);
      if (!canScore(newRoll)) {
        setFarkleOccurred(true);
        pendingGroupIdsRef.current = [];
      } else if (pendingScoreRef.current > 0) {
        setSelectedGroupIds(pendingGroupIdsRef.current);
      }
    }, 800);
  }, [rollDiceValues]);

  const groupMap = useMemo(() => {
    const map = new Map<string, ScoringGroup>();
    scoringGroups.forEach((group) => map.set(group.id, group));
    return map;
  }, [scoringGroups]);

  const selectedIndices = useMemo(() => {
    const set = new Set<number>();
    selectedGroupIds.forEach((id) => {
      const group = groupMap.get(id);
      group?.indices.forEach((idx) => set.add(idx));
    });
    return Array.from(set.values()).sort((a, b) => a - b);
  }, [selectedGroupIds, groupMap]);

  const selectedScorePreview = useMemo(() => {
    return selectedGroupIds.reduce((sum, id) => {
      const group = groupMap.get(id);
      return sum + (group?.score || 0);
    }, 0);
  }, [selectedGroupIds, groupMap]);

  const hasBankableSelection = selectedGroupIds.length > 0 && selectedScorePreview > 0;

  const selectableIndexSet = useMemo(() => {
    const set = new Set<number>();
    Object.entries(indexGroupMap).forEach(([key, ids]) => {
      if (ids && ids.length > 0) {
        set.add(Number(key));
      }
    });
    return set;
  }, [indexGroupMap]);

  const getGroupsForIndex = useCallback(
    (index: number): ScoringGroup[] => {
      const ids = indexGroupMap[index] || [];
      return ids
        .map((id) => groupMap.get(id))
        .filter((group): group is ScoringGroup => Boolean(group));
    },
    [indexGroupMap, groupMap]
  );

  const addIndexToSelection = useCallback(
    (index: number) => {
      setSelectedGroupIds((prev) => {
        const used = new Set<number>();
        prev.forEach((id) => {
          const group = groupMap.get(id);
          group?.indices.forEach((idx) => used.add(idx));
        });
        const candidates = getGroupsForIndex(index).filter((group) =>
          group.indices.every((idx) => !used.has(idx))
        );
        if (!candidates.length) return prev;
        candidates.sort(
          (a, b) => b.score - a.score || a.indices.length - b.indices.length
        );
        const chosen = candidates[0];
        if (prev.includes(chosen.id)) return prev;
        return [...prev, chosen.id];
      });
    },
    [getGroupsForIndex, groupMap]
  );

  const removeIndexFromSelection = useCallback(
    (index: number) => {
      setSelectedGroupIds((prev) => {
        const groupsToRemove = prev
          .map((id) => groupMap.get(id))
          .filter(
            (group): group is ScoringGroup =>
              Boolean(group && group.indices.includes(index))
          );
        if (!groupsToRemove.length) return prev;
        let updated = prev.filter(
          (id) => !groupsToRemove.some((group) => group.id === id)
        );
        const used = new Set<number>();
        updated.forEach((id) => {
          const group = groupMap.get(id);
          group?.indices.forEach((idx) => used.add(idx));
        });
        groupsToRemove.forEach((group) => {
          group.indices.forEach((idx) => {
            if (idx === index || used.has(idx)) return;
            const alternatives = getGroupsForIndex(idx).filter((candidate) =>
              candidate.indices.every((i) => !used.has(i) && i !== index)
            );
            if (!alternatives.length) return;
            alternatives.sort(
              (a, b) => b.score - a.score || a.indices.length - b.indices.length
            );
            const chosen = alternatives[0];
            if (updated.includes(chosen.id)) return;
            updated = [...updated, chosen.id];
            chosen.indices.forEach((i) => used.add(i));
          });
        });
        return updated;
      });
    },
    [groupMap, getGroupsForIndex]
  );

  const bankSelectedGroups = useCallback(() => {
    if (selectedGroupIds.length === 0) return null;
    const scoreToAdd = selectedScorePreview;
    if (scoreToAdd === 0) return null;

    const diceUsed = selectedIndices.length;
    const remainingDice = availableDice - diceUsed;
    const diceToRollNext = remainingDice <= 0 ? 6 : remainingDice;

    setTurnScore((prev) => prev + scoreToAdd);
    setAvailableDice(remainingDice <= 0 ? 0 : remainingDice);
    setCurrentRoll([]);
    setSelectedGroupIds([]);
    setScoringGroups([]);
    setIndexGroupMap({});
    setHasRolled(false);
    setFarkleOccurred(false);

    return diceToRollNext;
  }, [
    selectedGroupIds,
    selectedScorePreview,
    selectedIndices,
    availableDice,
  ]);

  const isHotDice = useMemo(() => {
    if (currentRoll.length === 0 || !hasRolled || isRolling) return false;
    return canScore(currentRoll) && currentRoll.length === availableDice;
  }, [currentRoll, hasRolled, isRolling, availableDice]);

  const handleDiceClick = useCallback(
    (index: number) => {
      if (isRolling || farkleOccurred || !hasRolled || gameOver) return;
      if (!selectableIndexSet.has(index)) return;
      if (selectedIndices.includes(index)) {
        removeIndexFromSelection(index);
      } else {
        addIndexToSelection(index);
      }
    },
    [
      isRolling,
      farkleOccurred,
      hasRolled,
      gameOver,
      selectableIndexSet,
      selectedIndices,
      removeIndexFromSelection,
      addIndexToSelection,
    ]
  );

  const handleRoll = useCallback(() => {
    if (gameOver || isRolling) return;
    if (!hasRolled) {
      const diceToRoll = availableDice === 0 ? 6 : availableDice;
      if (availableDice === 0) {
        setAvailableDice(6);
      }
      executeRoll(diceToRoll);
      return;
    }

    const diceToRoll = bankSelectedGroups();
    if (diceToRoll === null) return;
    setAvailableDice(diceToRoll);
    executeRoll(diceToRoll);
  }, [
    gameOver,
    isRolling,
    hasRolled,
    availableDice,
    executeRoll,
    bankSelectedGroups,
  ]);

  const finalizeTurn = useCallback(
    (scoreValue: number, note: string) => {
      if (players.length === 0) return;
      const player = players[currentPlayerIndex];
      setScores((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          player,
          score: scoreValue,
          note,
        },
      ]);
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      resetTurnState();
    },
    [players, currentPlayerIndex, resetTurnState]
  );

  const handleEndTurn = useCallback(() => {
    if (gameOver) return;
    const totalScore = turnScore + (selectedGroupIds.length > 0 ? selectedScorePreview : 0);
    if (totalScore === 0) return;
    finalizeTurn(totalScore, 'Simulation');
  }, [gameOver, turnScore, selectedGroupIds, selectedScorePreview, finalizeTurn]);

  const handleFarkle = useCallback(() => {
    if (gameOver) return;
    finalizeTurn(0, 'Farkle');
  }, [gameOver, finalizeTurn]);

  const canRoll =
    !gameOver &&
    !isRolling &&
    players.length > 0 &&
    (!hasRolled || hasBankableSelection);

  const canEndTurn = !gameOver && (turnScore > 0 || hasBankableSelection);

  const displayedDice =
    hasRolled || isRolling
      ? currentRoll.length > 0
        ? currentRoll
        : Array((availableDice === 0 ? 6 : availableDice)).fill(1)
      : [];

  const finalTotals = players.map((player) => ({
    player,
    total: playerTotals[player] || 0,
  })).sort((a, b) => b.total - a.total);

  const handleBackToSetup = () => {
    navigate('/game-setup');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <p className="text-lg font-semibold" style={{ color: theme.text }}>
          Loading game...
        </p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <>
        <Header />
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4"
          style={{ backgroundColor: theme.background }}
        >
          <p className="text-lg font-semibold" style={{ color: theme.text }}>
            No simulation game configured.
          </p>
          <CustomButton
            title="Go to Simulation Setup"
            onPress={handleBackToSetup}
            style={{ minWidth: '220px' }}
          />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: theme.background }}>
      <Header />
      <div className="flex-1 p-5 md:p-8 space-y-5">
        <CompactPlayerScoreboard
          players={players}
          totals={playerTotals}
          targetScore={targetScore}
          currentPlayerIndex={currentPlayerIndex}
        />

        <TurnScoreDisplay
          currentPlayer={currentPlayer}
          turnScore={turnScore}
          selectedScorePreview={selectedScorePreview}
          farkleOccurred={farkleOccurred}
          isHotDice={isHotDice}
        />

        <DiceGameCanvas
          dice={displayedDice}
          availableDice={availableDice === 0 ? 6 : availableDice}
          isRolling={isRolling}
          hasRolled={hasRolled}
          selectedIndices={selectedIndices}
          selectableIndices={selectableIndexSet}
          onDiceClick={handleDiceClick}
          farkleOccurred={farkleOccurred}
          gameOver={gameOver}
        />

        <GameActionButtons
          onRoll={handleRoll}
          onEndTurn={handleEndTurn}
          onFarkle={handleFarkle}
          canRoll={canRoll}
          canEndTurn={canEndTurn}
          farkleOccurred={farkleOccurred}
          hasRolled={hasRolled}
          isRolling={isRolling}
          gameOver={gameOver}
        />
      </div>

      {gameOver && (
        <GameOverModal
          visible={gameOver}
          winner={winner}
          finalScores={finalTotals}
          onRestart={handleBackToSetup}
        />
      )}
    </div>
  );
};

export default Game;

