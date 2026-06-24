/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'master';

export interface GameNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  isHinted?: boolean;
}

export interface GameEdge {
  id: string;
  nodeAId: string;
  nodeBId: string;
  isIntersecting: boolean;
}

export interface Level {
  levelNumber: number;
  difficulty: Difficulty;
  nodes: GameNode[];
  edges: GameEdge[];
  solvedNodePositions: { [id: string]: { x: number; y: number } };
}

export interface GameStats {
  levelsCompleted: number;
  totalTimePlayed: number; // in seconds
  bestStreak: number;
  currentStreak: number;
  hintsUsed: number;
  totalCoinsEarned: number;
}

export interface GameSettings {
  soundOn: boolean;
  hapticsOn: boolean;
  showTutorial: boolean;
}

export type ShopItemType = 'theme' | 'rope' | 'effect';

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  type: ShopItemType;
  value: string; // theme id, rope id, or effect id
  previewColor: string; // hex or tailwind class for display
  description: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  background: string; // tailwind class(es)
  cardBg: string; // tailwind class
  text: string; // tailwind class
  textMuted: string; // tailwind class
  primary: string; // hex for SVG or direct style
  secondary: string;
  accent: string;
  edgeNormal: string; // color of intersecting edges (e.g. red)
  edgeSolved: string; // color of non-intersecting edges (e.g. emerald)
  nodeFill: string; // color of nodes
  nodeStroke: string; // border color of nodes
}

export interface RopeConfig {
  id: string;
  name: string;
  strokeWidth: number;
  dashArray?: string;
  glowClass?: string;
  doubleLine?: boolean;
}

export interface ParticleConfig {
  id: string;
  name: string;
  color: string;
  shape: 'circle' | 'sparkle' | 'star';
  count: number;
}

export interface SavedGameState {
  currentLevelNumber: number;
  coins: number;
  stats: GameStats;
  settings: GameSettings;
  unlockedItemIds: string[];
  equippedThemeId: string;
  equippedRopeId: string;
  equippedEffectId: string;
}
