/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameNode, GameEdge } from '../types';

/**
 * Calculates the orientation of three points.
 * Returns:
 *  0 -> collinear
 *  1 -> clockwise
 *  2 -> counterclockwise
 */
function getOrientation(p: { x: number; y: number }, q: { x: number; y: number }, r: { x: number; y: number }): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 1e-9) return 0; // collinear
  return val > 0 ? 1 : 2; // clock or counterclock
}

/**
 * Checks if point q lies on line segment pr
 */
function onSegment(p: { x: number; y: number }, q: { x: number; y: number }, r: { x: number; y: number }): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

/**
 * Checks if line segment AB and CD intersect.
 * Nodes that are shared between segments are NOT considered intersecting here.
 */
export function doSegmentsIntersect(
  a: { x: number; y: number; id?: string },
  b: { x: number; y: number; id?: string },
  c: { x: number; y: number; id?: string },
  d: { x: number; y: number; id?: string }
): boolean {
  // If they share any endpoint, they don't intersect in a crossing way (they just touch at the node)
  if (a.id && c.id && (a.id === c.id || a.id === d.id || b.id === c.id || b.id === d.id)) {
    return false;
  }

  const o1 = getOrientation(a, b, c);
  const o2 = getOrientation(a, b, d);
  const o3 = getOrientation(c, d, a);
  const o4 = getOrientation(c, d, b);

  // General Case
  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  // Special Cases (collinear segments overlap)
  if (o1 === 0 && onSegment(a, c, b)) return true;
  if (o2 === 0 && onSegment(a, d, b)) return true;
  if (o3 === 0 && onSegment(c, a, d)) return true;
  if (o4 === 0 && onSegment(c, b, d)) return true;

  return false;
}

/**
 * Calculates distance between two points.
 */
export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Re-evaluates intersections for all edges.
 * Returns the updated list of edges with updated `isIntersecting` status and the total intersection count.
 */
export function updateEdgeIntersections(nodes: GameNode[], edges: GameEdge[]): { updatedEdges: GameEdge[]; intersectionCount: number } {
  // Create a fast lookup map for node coordinates
  const nodeMap = new Map<string, GameNode>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  // Initialize intersection status for all edges to false
  const updatedEdges = edges.map((e) => ({ ...e, isIntersecting: false }));

  let intersectionCount = 0;
  const intersectedPairs = new Set<string>();

  for (let i = 0; i < updatedEdges.length; i++) {
    for (let j = i + 1; j < updatedEdges.length; j++) {
      const e1 = updatedEdges[i];
      const e2 = updatedEdges[j];

      const n1a = nodeMap.get(e1.nodeAId);
      const n1b = nodeMap.get(e1.nodeBId);
      const n2a = nodeMap.get(e2.nodeAId);
      const n2b = nodeMap.get(e2.nodeBId);

      if (!n1a || !n1b || !n2a || !n2b) continue;

      const pt1a = { x: n1a.x, y: n1a.y, id: n1a.id };
      const pt1b = { x: n1b.x, y: n1b.y, id: n1b.id };
      const pt2a = { x: n2a.x, y: n2a.y, id: n2a.id };
      const pt2b = { x: n2b.x, y: n2b.y, id: n2b.id };

      if (doSegmentsIntersect(pt1a, pt1b, pt2a, pt2b)) {
        e1.isIntersecting = true;
        e2.isIntersecting = true;
        
        // Count unique crossing points
        const pairKey = [e1.id, e2.id].sort().join('-');
        if (!intersectedPairs.has(pairKey)) {
          intersectedPairs.add(pairKey);
          intersectionCount++;
        }
      }
    }
  }

  return { updatedEdges, intersectionCount };
}

/**
 * Calculates a point's coordinates on a circle centered at (cx, cy) with radius r.
 */
export function getCirclePosition(cx: number, cy: number, r: number, index: number, total: number): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2; // Start from top
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}
