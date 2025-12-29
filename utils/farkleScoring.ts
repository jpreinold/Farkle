// Farkle scoring rules and utilities

export type ScoringGroupType =
  | 'single-1'
  | 'single-5'
  | 'three-kind'
  | 'four-kind'
  | 'five-kind'
  | 'six-kind'
  | 'straight'
  | 'three-pairs'
  | 'two-triplets';

export interface ScoringGroup {
  id: string;
  indices: number[];
  score: number;
  type: ScoringGroupType;
  requiresAll: boolean;
  value?: number;
}

export interface RollAnalysis {
  groups: ScoringGroup[];
  indexToGroupIds: Record<number, string[]>;
  bestGroupIds: string[];
  bestIndices: number[];
  bestScore: number;
}

/**
 * Calculate the score for a given set of dice values
 * @param dice Array of dice values (1-6)
 * @returns Total score for the dice combination
 */
export function calculateScore(dice: number[]): number {
  if (dice.length === 0) return 0;

  // Make a copy and sort for easier processing
  const sorted = [...dice].sort((a, b) => a - b);
  let score = 0;
  const counts = getCounts(sorted);

  // Check for special 6-dice combinations first (highest priority)
  if (dice.length === 6) {
    // Check for straight (1-2-3-4-5-6)
    if (isStraight(sorted)) {
      return 1500;
    }

    // Check for three pairs
    if (isThreePairs(sorted)) {
      return 1500;
    }

    // Check for two triplets
    if (isTwoTriplets(sorted)) {
      return 2500;
    }
  }

  // Process multiples (six, five, four, three of a kind)
  const processed = new Set<number>();

  // Process six of a kind
  for (let value = 1; value <= 6; value++) {
    if (counts[value] === 6) {
      score += value === 1 ? 3000 : value * 600;
      processed.add(value);
    }
  }

  // Process five of a kind
  for (let value = 1; value <= 6; value++) {
    if (counts[value] === 5 && !processed.has(value)) {
      score += value === 1 ? 2000 : value * 400;
      processed.add(value);
      // Remove 5, leave 1 for potential single scoring
      counts[value] = 1;
    }
  }

  // Process four of a kind
  for (let value = 1; value <= 6; value++) {
    if (counts[value] === 4 && !processed.has(value)) {
      score += value === 1 ? 1000 : value * 200;
      processed.add(value);
      // Remove 4, leave 0 (all used)
      counts[value] = 0;
    }
  }

  // Process three of a kind (can have multiple)
  for (let value = 1; value <= 6; value++) {
    if (counts[value] >= 3 && !processed.has(value)) {
      const triplets = Math.floor(counts[value] / 3);
      score += (value === 1 ? 1000 : value * 100) * triplets;
      // Remove the triplets, leave remainder
      counts[value] = counts[value] % 3;
      if (counts[value] === 0) {
        processed.add(value);
      }
    }
  }

  // Process single 1s and 5s (only if not part of a triplet/multiple)
  for (let value = 1; value <= 6; value++) {
    if (!processed.has(value) && counts[value] > 0) {
      if (value === 1) {
        score += 100 * counts[value];
      } else if (value === 5) {
        score += 50 * counts[value];
      }
    }
  }

  return score;
}

/**
 * Check if dice can form any scoring combination
 * @param dice Array of dice values (1-6)
 * @returns true if dice can score
 */
export function canScore(dice: number[]): boolean {
  return calculateScore(dice) > 0;
}

/**
 * Get indices of dice that can be scored
 * This is a simplified version - returns all dice indices if any scoring is possible
 * @param dice Array of dice values (1-6)
 * @returns Array of indices that could be part of scoring combinations
 */
export function getScoringDice(dice: number[]): number[] {
  if (!canScore(dice)) return [];

  // For simplicity, return all indices if scoring is possible
  // The actual selection logic will validate combinations
  return dice.map((_, index) => index);
}

/**
 * Validate that selected dice form a valid scoring combination
 * @param selectedIndices Array of selected dice indices
 * @param allDice Array of all dice values (1-6)
 * @returns true if selection is valid
 */
export function validateSelection(selectedIndices: number[], allDice: number[]): boolean {
  if (selectedIndices.length === 0) return false;

  // Get the dice values for selected indices
  const selectedDice = selectedIndices.map(idx => allDice[idx]);

  // Check if the selected dice can score
  return canScore(selectedDice);
}

/**
 * Check if dice form a straight (1-2-3-4-5-6)
 */
function isStraight(sorted: number[]): boolean {
  if (sorted.length !== 6) return false;
  for (let i = 0; i < 6; i++) {
    if (sorted[i] !== i + 1) return false;
  }
  return true;
}

/**
 * Check if dice form three pairs
 */
function isThreePairs(sorted: number[]): boolean {
  if (sorted.length !== 6) return false;
  const counts = getCounts(sorted);
  let pairCount = 0;
  for (let value = 1; value <= 6; value++) {
    if (counts[value] === 2) pairCount++;
  }
  return pairCount === 3;
}

/**
 * Check if dice form two triplets
 */
function isTwoTriplets(sorted: number[]): boolean {
  if (sorted.length !== 6) return false;
  const counts = getCounts(sorted);
  let tripletCount = 0;
  for (let value = 1; value <= 6; value++) {
    if (counts[value] === 3) tripletCount++;
  }
  return tripletCount === 2;
}

/**
 * Get count of each die value
 */
function getCounts(dice: number[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const die of dice) {
    counts[die] = (counts[die] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate score for a selection of dice (helper for banking)
 * @param selectedIndices Array of selected dice indices
 * @param allDice Array of all dice values
 * @returns Score for the selected dice, or 0 if invalid
 */
export function calculateSelectionScore(selectedIndices: number[], allDice: number[]): number {
  if (!validateSelection(selectedIndices, allDice)) return 0;
  const selectedDice = selectedIndices.map(idx => allDice[idx]);
  return calculateScore(selectedDice);
}

function scoreForMultiple(value: number, count: number): number {
  if (count === 3) {
    return value === 1 ? 1000 : value * 100;
  }
  if (count === 4) {
    return value === 1 ? 1000 : value * 200;
  }
  if (count === 5) {
    return value === 1 ? 2000 : value * 400;
  }
  // count === 6
  return value === 1 ? 3000 : value * 600;
}

function typeForMultiple(count: number): ScoringGroupType {
  if (count === 3) return 'three-kind';
  if (count === 4) return 'four-kind';
  if (count === 5) return 'five-kind';
  return 'six-kind';
}

function getAllCombinations(indices: number[], size: number): number[][] {
  const results: number[][] = [];
  const combo: number[] = [];

  function backtrack(start: number) {
    if (combo.length === size) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < indices.length; i++) {
      combo.push(indices[i]);
      backtrack(i + 1);
      combo.pop();
    }
  }

  backtrack(0);
  return results;
}

export function analyzeRoll(dice: number[]): RollAnalysis {
  const groups: ScoringGroup[] = [];
  const indexToGroupIds: Record<number, string[]> = {};
  let groupCounter = 0;

  const addGroup = (
    indices: number[],
    score: number,
    type: ScoringGroupType,
    requiresAll: boolean,
    value?: number
  ) => {
    if (score <= 0 || indices.length === 0) return;
    const id = `${type}-${groupCounter++}`;
    const group: ScoringGroup = { id, indices: [...indices], score, type, requiresAll, value };
    groups.push(group);
    indices.forEach((idx) => {
      if (!indexToGroupIds[idx]) {
        indexToGroupIds[idx] = [];
      }
      indexToGroupIds[idx].push(id);
    });
  };

  const valueToIndices: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  dice.forEach((value, index) => {
    valueToIndices[value].push(index);
    if (value === 1) {
      addGroup([index], 100, 'single-1', true, value);
    } else if (value === 5) {
      addGroup([index], 50, 'single-5', true, value);
    }
  });

  for (let value = 1; value <= 6; value++) {
    const indices = valueToIndices[value];
    if (indices.length >= 3) {
      for (let count = 3; count <= indices.length; count++) {
        const combos = getAllCombinations(indices, count);
        combos.forEach((combo) => {
          addGroup(combo, scoreForMultiple(value, count), typeForMultiple(count), true, value);
        });
      }
    }
  }

  if (dice.length === 6) {
    const allIndices = dice.map((_, idx) => idx);
    const sorted = [...dice].sort((a, b) => a - b);
    if (isStraight(sorted)) {
      addGroup(allIndices, 1500, 'straight', true);
    }
    if (isThreePairs(sorted)) {
      const pairIndices = Object.entries(valueToIndices)
        .filter(([, arr]) => arr.length === 2)
        .flatMap(([, arr]) => arr);
      addGroup(pairIndices, 1500, 'three-pairs', true);
    }
    if (isTwoTriplets(sorted)) {
      const tripletIndices = Object.entries(valueToIndices)
        .filter(([, arr]) => arr.length === 3)
        .flatMap(([, arr]) => arr);
      addGroup(tripletIndices, 2500, 'two-triplets', true);
    }
  }

  const groupMasks = groups.map((group) =>
    group.indices.reduce((mask, idx) => mask | (1 << idx), 0)
  );

  let bestScore = 0;
  let bestGroupIds: string[] = [];

  const dfs = (index: number, usedMask: number, score: number, selectedIds: string[]) => {
    if (index === groups.length) {
      if (score > bestScore) {
        bestScore = score;
        bestGroupIds = [...selectedIds];
      }
      return;
    }

    dfs(index + 1, usedMask, score, selectedIds);

    const mask = groupMasks[index];
    if ((usedMask & mask) === 0) {
      dfs(
        index + 1,
        usedMask | mask,
        score + groups[index].score,
        [...selectedIds, groups[index].id]
      );
    }
  };

  dfs(0, 0, 0, []);

  const bestIndicesSet = new Set<number>();
  bestGroupIds.forEach((id) => {
    const group = groups.find((g) => g.id === id);
    if (group) {
      group.indices.forEach((idx) => bestIndicesSet.add(idx));
    }
  });

  return {
    groups,
    indexToGroupIds,
    bestGroupIds,
    bestIndices: Array.from(bestIndicesSet.values()),
    bestScore,
  };
}
