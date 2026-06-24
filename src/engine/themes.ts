/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeConfig, RopeConfig, ParticleConfig } from '../types';

export const THEME_CONFIGS: { [id: string]: ThemeConfig } = {
  classic: {
    id: 'classic',
    name: 'Neon Classic',
    background: 'bg-slate-950 bg-radial-gradient from-slate-900 to-slate-950',
    cardBg: 'bg-slate-900/80 border border-slate-800',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    primary: '#06b6d4', // cyan-500
    secondary: '#8b5cf6', // violet-500
    accent: '#f43f5e', // rose-500
    edgeNormal: '#ef4444', // red-500 (intersecting)
    edgeSolved: '#10b981', // emerald-500 (solved/non-intersecting)
    nodeFill: '#ffffff',
    nodeStroke: '#06b6d4',
  },
  forest: {
    id: 'forest',
    name: 'Floresta Calma',
    background: 'bg-stone-100 bg-[radial-gradient(#e7e5e4_1px,transparent_1px)] [background-size:16px_16px]',
    cardBg: 'bg-white/90 border border-stone-200 shadow-md',
    text: 'text-stone-800',
    textMuted: 'text-stone-500',
    primary: '#15803d', // green-700
    secondary: '#b45309', // amber-700
    accent: '#0284c7', // sky-600
    edgeNormal: '#dc2626', // red-600
    edgeSolved: '#16a34a', // green-600
    nodeFill: '#f5f5f4', // stone-100
    nodeStroke: '#15803d',
  },
  sunset: {
    id: 'sunset',
    name: 'Pôr do Sol',
    background: 'bg-neutral-900 bg-radial-gradient from-amber-950/20 to-neutral-950',
    cardBg: 'bg-neutral-900/90 border border-amber-950/40 shadow-xl',
    text: 'text-amber-50',
    textMuted: 'text-neutral-400',
    primary: '#f97316', // orange-500
    secondary: '#ec4899', // pink-500
    accent: '#eab308', // yellow-500
    edgeNormal: '#ef4444', // red-500
    edgeSolved: '#f97316', // orange-500
    nodeFill: '#fff7ed', // orange-50
    nodeStroke: '#ea580c', // orange-600
  },
  space: {
    id: 'space',
    name: 'Espaço Profundo',
    background: 'bg-black bg-[radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px]',
    cardBg: 'bg-slate-950/90 border border-indigo-950/60 shadow-2xl shadow-indigo-950/30',
    text: 'text-indigo-50',
    textMuted: 'text-indigo-300/60',
    primary: '#d97706', // gold/amber-600
    secondary: '#6366f1', // indigo-500
    accent: '#ec4899', // pink-500
    edgeNormal: '#be123c', // rose-700
    edgeSolved: '#f59e0b', // amber-500 (glowing stellar trails)
    nodeFill: '#1e1b4b', // indigo-950
    nodeStroke: '#fbbf24', // amber-400
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk',
    background: 'bg-zinc-950 border-t-4 border-yellow-400',
    cardBg: 'bg-zinc-900 border border-yellow-500/30 shadow-none',
    text: 'text-yellow-400 font-mono',
    textMuted: 'text-zinc-500 font-mono',
    primary: '#f43f5e', // neon pink
    secondary: '#06b6d4', // neon cyan
    accent: '#eab308', // neon yellow
    edgeNormal: '#dc2626', // red
    edgeSolved: '#f43f5e', // neon pink
    nodeFill: '#000000',
    nodeStroke: '#eab308',
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage Coffee',
    background: 'bg-amber-50/80 bg-[radial-gradient(#b45309_0.5px,transparent_0.5px)] [background-size:12px_12px]',
    cardBg: 'bg-amber-100/90 border-2 border-amber-800/30 shadow-sm',
    text: 'text-amber-950 font-serif',
    textMuted: 'text-amber-800/60 font-sans',
    primary: '#78350f', // warm brown
    secondary: '#92400e', // amber-800
    accent: '#451a03', // dark-chocolate
    edgeNormal: '#b91c1c', // red
    edgeSolved: '#78350f', // brown
    nodeFill: '#fef3c7', // amber-100
    nodeStroke: '#78350f',
  }
};

export const ROPE_CONFIGS: { [id: string]: RopeConfig } = {
  classic: {
    id: 'classic',
    name: 'Corda Clássica',
    strokeWidth: 4,
  },
  glow: {
    id: 'glow',
    name: 'Neon Brilhante',
    strokeWidth: 5,
    glowClass: 'glow-effect',
  },
  double: {
    id: 'double',
    name: 'Corda Dupla',
    strokeWidth: 6,
    doubleLine: true,
  },
  dashed: {
    id: 'dashed',
    name: 'Linha Tracejada',
    strokeWidth: 4,
    dashArray: '8,6',
  },
  sisal: {
    id: 'sisal',
    name: 'Corda de Sisal',
    strokeWidth: 6,
    dashArray: '12,3,3,3',
  }
};

export const PARTICLE_CONFIGS: { [id: string]: ParticleConfig } = {
  none: {
    id: 'none',
    name: 'Sem Efeitos',
    color: 'transparent',
    shape: 'circle',
    count: 0,
  },
  particles: {
    id: 'particles',
    name: 'Partículas de Impacto',
    color: '#38bdf8',
    shape: 'sparkle',
    count: 12,
  },
  ripple: {
    id: 'ripple',
    name: 'Ondas Ondulatórias',
    color: '#ec4899',
    shape: 'circle',
    count: 1,
  },
  confetti: {
    id: 'confetti',
    name: 'Chuvas de Vitória',
    color: '#10b981',
    shape: 'star',
    count: 24,
  }
};
