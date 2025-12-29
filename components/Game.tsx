// components/Game.tsx
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import CustomButton from "./CustomButton";
import { ThemeContext } from "./ThemeContext";
import storage from "../utils/storage";
import CompactPlayerScoreboard from "./CompactPlayerScoreboard";
import TurnScoreDisplay from "./TurnScoreDisplay";
import DiceGameCanvas from "./DiceGameCanvas";
import GameActionButtons from "./GameActionButtons";
import ManualEntryPanel from "./ManualEntryPanel";
import GameOverModal from "./GameOverModal";
import { canScore, analyzeRoll, ScoringGroup } from "../utils/farkleScoring";

type ScoreSource = "auto" | "manual";

interface ScoreEntry {
  id: number;
  player: string;
  score: number;
  note: string;
  source: ScoreSource;
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
  const [winner, setWinner] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualScoreInput, setManualScoreInput] = useState("");
  const [manualNoteInput, setManualNoteInput] = useState("");

  const [availableDice, setAvailableDice] = useState(6);
  const [currentRoll, setCurrentRoll] = useState<number[]>([]);
  const [scoringGroups, setScoringGroups] = useState<ScoringGroup[]>([]);
  const [indexGroupMap, setIndexGroupMap] = useState<Record<number, string[]>>(
    {}
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [turnScore, setTurnScore] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [farkleOccurred, setFarkleOccurred] = useState(false);

  const currentPlayer = players[currentPlayerIndex] || "";

  const pendingGroupIdsRef = useRef<string[]>([]);
  const pendingScoreRef = useRef(0);

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
    setManualScoreInput("");
    setManualNoteInput("");
    pendingGroupIdsRef.current = [];
    pendingScoreRef.current = 0;
  }, []);

  useEffect(() => {
    const loadSimulation = async () => {
      try {
        const config = await storage.getItem("GAME_CONFIG_SIMULATION");
        if (!config) {
          navigate("/game-setup");
          return;
        }
        const parsedConfig = JSON.parse(config);
        if (!parsedConfig.players || parsedConfig.players.length === 0) {
          navigate("/game-setup");
          return;
        }
        setPlayers(parsedConfig.players);
        setTargetScore(parsedConfig.targetScore || 10000);

        const savedState = await storage.getItem("GAME_STATE_SIMULATION");
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          const normalizedScores: ScoreEntry[] = (
            (parsedState.scores || []) as ScoreEntry[]
          ).map((entry, index) => ({
            id: entry?.id ?? index + 1,
            player: entry?.player || "",
            score: entry?.score || 0,
            note: entry?.note || "",
            source: entry?.source === "manual" ? "manual" : "auto",
          }));
          setScores(normalizedScores);
          setCurrentPlayerIndex(parsedState.currentPlayerIndex || 0);
          setGameOver(parsedState.gameOver || false);
          setWinner(parsedState.winner || "");
        }
      } catch (error) {
        console.error("Error loading simulation game state:", error);
        navigate("/game-setup");
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
        await storage.setItem("GAME_STATE_SIMULATION", JSON.stringify(state));
      } catch (error) {
        console.error("Error saving simulation game state:", error);
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
    setWinner("");
  }, [players, playerTotals, targetScore]);

  const rollDiceValues = useCallback((count: number): number[] => {
    return Array.from(
      { length: count },
      () => Math.floor(Math.random() * 6) + 1
    );
  }, []);

  const executeRoll = useCallback(
    (count: number) => {
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
    },
    [rollDiceValues]
  );

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

  const manualPendingScore = useMemo(() => {
    const parsed = parseInt(manualScoreInput, 10);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    return Math.max(0, parsed);
  }, [manualScoreInput]);

  const displaySelectedScorePreview = isManualMode
    ? manualPendingScore
    : selectedScorePreview;

  const hasBankableSelection =
    selectedGroupIds.length > 0
      ? selectedScorePreview > 0
      : pendingScoreRef.current > 0;

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
        const candidates = getGroupsForIndex(index);
        if (!candidates.length) return prev;

        const sortedCandidates = [...candidates].sort(
          (a, b) => b.score - a.score || a.indices.length - b.indices.length
        );

        for (const candidate of sortedCandidates) {
          const conflicts = prev.filter((id) => {
            const group = groupMap.get(id);
            if (!group) return false;
            return group.indices.some((idx) => candidate.indices.includes(idx));
          });

          const canReplace = conflicts.every((id) => {
            const group = groupMap.get(id);
            return (
              group &&
              group.indices.every((idx) => candidate.indices.includes(idx))
            );
          });

          if (!canReplace && conflicts.length > 0) {
            continue;
          }

          let next = prev.filter((id) => !conflicts.includes(id));
          if (next.includes(candidate.id)) {
            return next;
          }
          return [...next, candidate.id];
        }

        return prev;
      });
    },
    [getGroupsForIndex, groupMap]
  );

  const removeIndexFromSelection = useCallback(
    (index: number) => {
      setSelectedGroupIds((prev) => {
        const allIndicesSet = new Set<number>();
        prev.forEach((id) => {
          const group = groupMap.get(id);
          group?.indices.forEach((idx) => allIndicesSet.add(idx));
        });

        if (!allIndicesSet.has(index)) {
          return prev;
        }

        const desiredIndices = Array.from(allIndicesSet.values()).filter(
          (idx) => idx !== index
        );

        let next = prev.filter((id) => {
          const group = groupMap.get(id);
          return group && !group.indices.includes(index);
        });

        const usedIndices = new Set<number>();
        next.forEach((id) => {
          const group = groupMap.get(id);
          group?.indices.forEach((idx) => usedIndices.add(idx));
        });

        const needsCoverage = desiredIndices.filter(
          (idx) => !usedIndices.has(idx)
        );

        needsCoverage.forEach((idx) => {
          const candidates = getGroupsForIndex(idx).filter((candidate) =>
            candidate.indices.every((i) => !usedIndices.has(i) && i !== index)
          );
          if (!candidates.length) {
            return;
          }
          candidates.sort(
            (a, b) => b.score - a.score || a.indices.length - b.indices.length
          );
          const chosen = candidates[0];
          if (next.includes(chosen.id)) {
            return;
          }
          next = [...next, chosen.id];
          chosen.indices.forEach((i) => usedIndices.add(i));
        });

        return next;
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
    pendingGroupIdsRef.current = [];
    pendingScoreRef.current = 0;

    return diceToRollNext;
  }, [selectedGroupIds, selectedScorePreview, selectedIndices, availableDice]);

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
    (scoreValue: number, note: string, source: ScoreSource = "auto") => {
      if (players.length === 0) return;
      const player = players[currentPlayerIndex];
      setScores((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          player,
          score: scoreValue,
          note,
          source,
        },
      ]);
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      resetTurnState();
    },
    [players, currentPlayerIndex, resetTurnState]
  );

  const handleManualScoreChange = useCallback((value: string) => {
    setManualScoreInput(value);
  }, []);

  const handleManualNoteChange = useCallback((value: string) => {
    setManualNoteInput(value);
  }, []);

  const handleManualBank = useCallback(() => {
    if (gameOver) return;
    if (manualPendingScore <= 0) return;
    setTurnScore((prev) => prev + manualPendingScore);
    setManualScoreInput("");
  }, [gameOver, manualPendingScore]);

  const handleManualSubmit = useCallback(() => {
    if (gameOver) return;
    const pendingScore = manualPendingScore;
    const totalScore = turnScore + pendingScore;
    if (totalScore === 0) return;
    const note = manualNoteInput.trim() || "Manual Entry";
    finalizeTurn(totalScore, note, "manual");
  }, [gameOver, manualPendingScore, turnScore, manualNoteInput, finalizeTurn]);

  const handleManualFarkle = useCallback(() => {
    if (gameOver) return;
    const note = manualNoteInput.trim() || "Manual Farkle";
    finalizeTurn(0, note, "manual");
  }, [gameOver, manualNoteInput, finalizeTurn]);

  const handleModeChange = useCallback(
    (manual: boolean) => {
      if (manual === isManualMode) return;
      resetTurnState();
      setIsManualMode(manual);
    },
    [isManualMode, resetTurnState]
  );

  const handleEndTurn = useCallback(() => {
    if (gameOver) return;
    const additionalScore =
      selectedGroupIds.length > 0
        ? selectedScorePreview
        : pendingScoreRef.current;
    const totalScore = turnScore + additionalScore;
    if (totalScore === 0) return;
    finalizeTurn(totalScore, "Simulation");
  }, [
    gameOver,
    turnScore,
    selectedGroupIds,
    selectedScorePreview,
    finalizeTurn,
  ]);

  const handleFarkle = useCallback(() => {
    if (gameOver) return;
    finalizeTurn(0, "Farkle");
  }, [gameOver, finalizeTurn]);

  const canRoll =
    !gameOver &&
    !isManualMode &&
    !isRolling &&
    players.length > 0 &&
    (!hasRolled || hasBankableSelection);

  const canEndTurn =
    !gameOver && !isManualMode && (turnScore > 0 || hasBankableSelection);

  const canBankManual = !gameOver && isManualMode && manualPendingScore > 0;
  const canSubmitManual =
    !gameOver && isManualMode && turnScore + manualPendingScore > 0;

  const displayedDice =
    hasRolled || isRolling
      ? currentRoll.length > 0
        ? currentRoll
        : Array(availableDice === 0 ? 6 : availableDice).fill(1)
      : [];

  const finalTotals = players
    .map((player) => ({
      player,
      total: playerTotals[player] || 0,
    }))
    .sort((a, b) => b.total - a.total);

  const handleBackToSetup = () => {
    navigate("/game-setup");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
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
            style={{ minWidth: "220px" }}
          />
        </div>
      </>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: theme.background }}
    >
      <Header />
      <div className="flex-1 p-5 md:p-8 space-y-5">
        <CompactPlayerScoreboard
          players={players}
          totals={playerTotals}
          targetScore={targetScore}
          currentPlayerIndex={currentPlayerIndex}
        />

        <div className="flex justify-center">
          <div
            className="inline-flex rounded-full overflow-hidden border"
            style={{ borderColor: theme.borderColor }}
          >
            <button
              type="button"
              onClick={() => handleModeChange(false)}
              className="px-4 py-2 text-sm font-semibold transition-colors duration-200"
              style={{
                backgroundColor: !isManualMode
                  ? theme.secondary
                  : theme.cardBackground,
                color: !isManualMode ? "#ffffff" : theme.text,
              }}
            >
              Dice
            </button>
            <button
              type="button"
              onClick={() => handleModeChange(true)}
              className="px-4 py-2 text-sm font-semibold transition-colors duration-200"
              style={{
                backgroundColor: isManualMode
                  ? theme.secondary
                  : theme.cardBackground,
                color: isManualMode ? "#ffffff" : theme.text,
              }}
            >
              Manual
            </button>
          </div>
        </div>

        <TurnScoreDisplay
          currentPlayer={currentPlayer}
          turnScore={turnScore}
          selectedScorePreview={displaySelectedScorePreview}
          farkleOccurred={farkleOccurred}
          isHotDice={isHotDice}
        />

        {isManualMode ? (
          <div
            className="card p-4"
            style={{
              backgroundColor: theme.cardBackground,
              boxShadow: `0 4px 16px ${theme.shadowColor}`,
            }}
          >
            <ManualEntryPanel
              currentPlayer={currentPlayer}
              scoreValue={manualScoreInput}
              noteValue={manualNoteInput}
              onScoreChange={handleManualScoreChange}
              onNoteChange={handleManualNoteChange}
              onBank={handleManualBank}
              onSubmit={handleManualSubmit}
              onFarkle={handleManualFarkle}
              canBank={canBankManual}
              canSubmit={canSubmitManual}
              disabled={gameOver}
            />
          </div>
        ) : (
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
        )}

        {!isManualMode && (
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
        )}
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
