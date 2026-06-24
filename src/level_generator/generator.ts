/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Level, GameNode, GameEdge, Difficulty } from '../types';
import { getCirclePosition, updateEdgeIntersections, distance } from '../engine/geometry';

/**
 * Gets the number of nodes and chord count based on the level number.
 */
export function getLevelConfig(level: number): {
  nodeCount: number;
  chordCount: number;
  difficulty: Difficulty;
} {
  let nodeCount = 4;
  let chordCount = 1;
  let difficulty: Difficulty = 'easy';

  if (level === 1) {
    nodeCount = 4;
    chordCount = 1;
    difficulty = 'easy';
  } else if (level <= 5) {
    // Level 2-5
    nodeCount = 5;
    chordCount = 2;
    difficulty = 'easy';
  } else if (level <= 10) {
    // Level 6-10
    nodeCount = 6;
    chordCount = 3;
    difficulty = 'easy';
  } else if (level <= 20) {
    // Level 11-20
    nodeCount = 8;
    chordCount = 4;
    difficulty = 'medium';
  } else if (level <= 35) {
    // Level 21-35
    nodeCount = 10;
    chordCount = 6;
    difficulty = 'medium';
  } else if (level <= 55) {
    // Level 36-55
    nodeCount = 13;
    chordCount = 9;
    difficulty = 'hard';
  } else if (level <= 75) {
    // Level 56-75
    nodeCount = 15;
    chordCount = 12;
    difficulty = 'hard';
  } else {
    // Level 76+
    nodeCount = Math.min(24, 16 + Math.floor((level - 75) / 10));
    chordCount = Math.min(22, 12 + Math.floor((level - 75) / 5));
    difficulty = 'master';
  }

  return { nodeCount, chordCount, difficulty };
}

/**
 * Checks if two chords on a circle cross each other.
 * Assumes a, b, c, d are indices on the circle (0 to N-1).
 */
function circularChordsCross(a: number, b: number, c: number, d: number): boolean {
  const normA = Math.min(a, b);
  const normB = Math.max(a, b);
  const normC = Math.min(c, d);
  const normD = Math.max(c, d);

  const cInside = normC > normA && normC < normB;
  const dInside = normD > normA && normD < normB;

  // They cross if exactly one endpoint of CD is inside AB
  return cInside !== dInside;
}

/**
 * Procedural generator for levels.
 * Guarantees a solvable level with crossings in the initial state.
 */
export function generateLevel(levelNumber: number): Level {
  const { nodeCount, chordCount, difficulty } = getLevelConfig(levelNumber);

  const cx = 300;
  const cy = 300;
  const r = 200;

  // Step 1: Create a valid planar graph without crossings
  // We place nodes on a perfect circle.
  const tempNodes: GameNode[] = [];
  const solvedNodePositions: { [id: string]: { x: number; y: number } } = {};

  for (let i = 0; i < nodeCount; i++) {
    const id = `node_${i}`;
    const pos = getCirclePosition(cx, cy, r, i, nodeCount);
    tempNodes.push({
      id,
      x: pos.x,
      y: pos.y,
      label: `${i + 1}`,
    });
    solvedNodePositions[id] = { x: pos.x, y: pos.y };
  }

  // Create perimeter edges (never cross)
  const edges: GameEdge[] = [];
  let edgeIdCounter = 0;

  for (let i = 0; i < nodeCount; i++) {
    const nextIdx = (i + 1) % nodeCount;
    edges.push({
      id: `edge_${edgeIdCounter++}`,
      nodeAId: tempNodes[i].id,
      nodeBId: tempNodes[nextIdx].id,
      isIntersecting: false,
    });
  }

  // Add chords that do not cross existing chords
  const addedChords: [number, number][] = [];
  let attempts = 0;
  const maxAttempts = 200;

  while (addedChords.length < chordCount && attempts < maxAttempts) {
    attempts++;
    const a = Math.floor(Math.random() * nodeCount);
    const b = Math.floor(Math.random() * nodeCount);

    // Cannot be same node, and cannot be adjacent
    if (a === b || Math.abs(a - b) === 1 || Math.abs(a - b) === nodeCount - 1) {
      continue;
    }

    // Check if this chord crosses any already added chords
    let crosses = false;
    for (const [ca, cb] of addedChords) {
      if (circularChordsCross(a, b, ca, cb)) {
        crosses = true;
        break;
      }
    }

    if (!crosses) {
      addedChords.push([a, b]);
      edges.push({
        id: `edge_${edgeIdCounter++}`,
        nodeAId: tempNodes[a].id,
        nodeBId: tempNodes[b].id,
        isIntersecting: false,
      });
    }
  }

  // Target minimum crossings based on difficulty to ensure a good puzzle
  let minCrossings = 1;
  if (difficulty === 'easy') minCrossings = 2;
  else if (difficulty === 'medium') minCrossings = 5;
  else if (difficulty === 'hard') minCrossings = 10;
  else if (difficulty === 'master') minCrossings = 20;

  // Step 2 & 3: Mix the node positions and ensure crossings
  let finalNodes: GameNode[] = [];
  let finalEdges: GameEdge[] = [];
  let shuffleAttempts = 0;
  let bestNodes: GameNode[] = [];
  let maxCrossingsFound = 0;

  const arenaPadding = 60;
  const arenaWidth = 600 - arenaPadding * 2;
  const arenaHeight = 600 - arenaPadding * 2;

  while (shuffleAttempts < 100) {
    shuffleAttempts++;
    const testNodes: GameNode[] = tempNodes.map((node) => {
      // Find a position that doesn't overlap too close to other shuffled nodes
      let rx = 0;
      let ry = 0;
      let validPos = false;
      let posAttempts = 0;

      while (!validPos && posAttempts < 50) {
        posAttempts++;
        rx = arenaPadding + Math.random() * arenaWidth;
        ry = arenaPadding + Math.random() * arenaHeight;

        validPos = true;
        // Check distance to other already placed test nodes
        for (const placedNode of finalNodes) {
          if (distance({ x: rx, y: ry }, placedNode) < 55) {
            validPos = false;
            break;
          }
        }
      }

      return {
        ...node,
        x: rx,
        y: ry,
      };
    });

    // Check the crossings for this shuffled state
    const { updatedEdges, intersectionCount } = updateEdgeIntersections(testNodes, edges);

    if (intersectionCount > maxCrossingsFound) {
      maxCrossingsFound = intersectionCount;
      bestNodes = testNodes;
    }

    // If we meet or exceed the target minimum crossings, we accept it immediately
    if (intersectionCount >= minCrossings) {
      finalNodes = testNodes;
      finalEdges = updatedEdges;
      break;
    }
  }

  // Fallback if we couldn't reach the target crossings in 100 attempts
  if (finalNodes.length === 0) {
    finalNodes = bestNodes;
    const { updatedEdges } = updateEdgeIntersections(finalNodes, edges);
    finalEdges = updatedEdges;
  }

  return {
    levelNumber,
    difficulty,
    nodes: finalNodes,
    edges: finalEdges,
    solvedNodePositions,
  };
}
