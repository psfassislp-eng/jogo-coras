/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameNode, GameEdge } from '../types';
import { doSegmentsIntersect } from '../engine/geometry';

export interface HintResult {
  type: 'node' | 'edge';
  targetId: string; // ID of the node or edge to highlight
  message: string;
}

/**
 * Evaluates the current state of the game and returns a smart hint.
 * Focuses on either:
 * - The node connected to the most crossings (to suggest moving it).
 * - The edge with the highest number of crossings.
 */
export function calculateHint(nodes: GameNode[], edges: GameEdge[]): HintResult | null {
  // If there are no intersecting edges, no hint needed
  const intersectingEdges = edges.filter((e) => e.isIntersecting);
  if (intersectingEdges.length === 0) {
    return null;
  }

  // Map nodes to their coordinates
  const nodeMap = new Map<string, GameNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Count intersections for each edge specifically
  const edgeIntersectionCounts = new Map<string, number>();
  intersectingEdges.forEach((e) => edgeIntersectionCounts.set(e.id, 0));

  for (let i = 0; i < intersectingEdges.length; i++) {
    for (let j = i + 1; j < intersectingEdges.length; j++) {
      const e1 = intersectingEdges[i];
      const e2 = intersectingEdges[j];

      const n1a = nodeMap.get(e1.nodeAId);
      const n1b = nodeMap.get(e1.nodeBId);
      const n2a = nodeMap.get(e2.nodeAId);
      const n2b = nodeMap.get(e2.nodeBId);

      if (!n1a || !n1b || !n2a || !n2b) continue;

      if (doSegmentsIntersect(n1a, n1b, n2a, n2b)) {
        edgeIntersectionCounts.set(e1.id, (edgeIntersectionCounts.get(e1.id) || 0) + 1);
        edgeIntersectionCounts.set(e2.id, (edgeIntersectionCounts.get(e2.id) || 0) + 1);
      }
    }
  }

  // Count intersections for each node (the sum of intersections of all connected edges)
  const nodeIntersectionCounts = new Map<string, number>();
  nodes.forEach((n) => nodeIntersectionCounts.set(n.id, 0));

  edges.forEach((e) => {
    const crossings = edgeIntersectionCounts.get(e.id) || 0;
    if (crossings > 0) {
      nodeIntersectionCounts.set(e.nodeAId, (nodeIntersectionCounts.get(e.nodeAId) || 0) + crossings);
      nodeIntersectionCounts.set(e.nodeBId, (nodeIntersectionCounts.get(e.nodeBId) || 0) + crossings);
    }
  });

  // Find node with highest intersection weight
  let maxNodeId = '';
  let maxNodeCrossings = -1;
  nodeIntersectionCounts.forEach((count, nodeId) => {
    if (count > maxNodeCrossings) {
      maxNodeCrossings = count;
      maxNodeId = nodeId;
    }
  });

  // Find edge with highest crossings
  let maxEdgeId = '';
  let maxEdgeCrossings = -1;
  edgeIntersectionCounts.forEach((count, edgeId) => {
    if (count > maxEdgeCrossings) {
      maxEdgeCrossings = count;
      maxEdgeId = edgeId;
    }
  });

  // Alternately hint a node or an edge, choosing the one with the biggest impact.
  // If the worst node is connected to many crossings, recommend moving it.
  if (maxNodeCrossings >= maxEdgeCrossings && maxNodeId) {
    const nodeObj = nodeMap.get(maxNodeId);
    const nodeLabel = nodeObj?.label || 'destacado';
    return {
      type: 'node',
      targetId: maxNodeId,
      message: `Tente mover o nó #${nodeLabel} para reduzir o número de cruzamentos!`,
    };
  } else if (maxEdgeId) {
    const edgeObj = edges.find((e) => e.id === maxEdgeId);
    const nodeA = nodeMap.get(edgeObj?.nodeAId || '');
    const nodeB = nodeMap.get(edgeObj?.nodeBId || '');
    const labelStr = nodeA && nodeB ? `entre os nós ${nodeA.label} e ${nodeB.label}` : '';
    return {
      type: 'edge',
      targetId: maxEdgeId,
      message: `A corda problemática ${labelStr} possui muitos cruzamentos. Reposicione seus nós!`,
    };
  }

  return null;
}
