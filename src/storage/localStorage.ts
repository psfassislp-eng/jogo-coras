/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedGameState, GameStats, GameSettings, ShopItem } from '../types';

const STORAGE_KEY = 'rope_untangle_game_state_v1';

export const SHOP_ITEMS: ShopItem[] = [
  // --- THEMES ---
  {
    id: 'theme_classic',
    name: 'Neon Classic',
    cost: 0,
    type: 'theme',
    value: 'classic',
    previewColor: '#06b6d4', // Cyan
    description: 'Fundo escuro com cordas de néon ciano e roxo.',
  },
  {
    id: 'theme_forest',
    name: 'Floresta Calma',
    cost: 100,
    type: 'theme',
    value: 'forest',
    previewColor: '#22c55e', // Green
    description: 'Estética serena de floresta com tons suaves de verde e creme.',
  },
  {
    id: 'theme_sunset',
    name: 'Pôr do Sol',
    cost: 200,
    type: 'theme',
    value: 'sunset',
    previewColor: '#f97316', // Orange/Amber
    description: 'Fundo escuro aquecido com detalhes em coral e âmbar.',
  },
  {
    id: 'theme_space',
    name: 'Espaço Profundo',
    cost: 350,
    type: 'theme',
    value: 'space',
    previewColor: '#a855f7', // Purple/Gold
    description: 'Tema cósmico escuro com pontos estelares e detalhes dourados.',
  },
  {
    id: 'theme_cyber',
    name: 'Cyberpunk',
    cost: 500,
    type: 'theme',
    value: 'cyber',
    previewColor: '#eab308', // Yellow/Pink
    description: 'Visual futurista de alta voltagem com amarelo neon e rosa elétrico.',
  },
  {
    id: 'theme_vintage',
    name: 'Vintage Coffee',
    cost: 650,
    type: 'theme',
    value: 'vintage',
    previewColor: '#78350f', // Warm Amber/Brown
    description: 'Uma atmosfera aconchegante com tons de sépia, caramelo e chocolate.',
  },

  // --- ROPES ---
  {
    id: 'rope_classic',
    name: 'Corda Clássica',
    cost: 0,
    type: 'rope',
    value: 'classic',
    previewColor: '#e2e8f0', // slate-200
    description: 'Linhas sólidas e limpas de espessura média.',
  },
  {
    id: 'rope_glow',
    name: 'Neon Brilhante',
    cost: 150,
    type: 'rope',
    value: 'glow',
    previewColor: '#00ffff', // Cyan glow
    description: 'Cordas com um brilho intenso de energia néon.',
  },
  {
    id: 'rope_double',
    name: 'Corda Dupla',
    cost: 250,
    type: 'rope',
    value: 'double',
    previewColor: '#38bdf8', // sky-400
    description: 'Cabo duplo reforçado de alta visibilidade.',
  },
  {
    id: 'rope_dashed',
    name: 'Linha Tracejada',
    cost: 350,
    type: 'rope',
    value: 'dashed',
    previewColor: '#f43f5e', // rose-500
    description: 'Estilo de cordas tracejadas com fluxo dinâmico.',
  },
  {
    id: 'rope_sisal',
    name: 'Corda de Sisal',
    cost: 450,
    type: 'rope',
    value: 'sisal',
    previewColor: '#d97706', // amber-600
    description: 'Textura trançada rústica que simula uma corda real.',
  },

  // --- EFFECTS ---
  {
    id: 'effect_none',
    name: 'Efeito Básico',
    cost: 0,
    type: 'effect',
    value: 'none',
    previewColor: '#ffffff',
    description: 'Sem efeitos adicionais ao soltar os nós.',
  },
  {
    id: 'effect_particles',
    name: 'Partículas de Impacto',
    cost: 150,
    type: 'effect',
    value: 'particles',
    previewColor: '#38bdf8', // sky glow
    description: 'Estrelas e faíscas explodem ao posicionar o nó.',
  },
  {
    id: 'effect_ripple',
    name: 'Ondas Ondulatórias',
    cost: 300,
    type: 'effect',
    value: 'ripple',
    previewColor: '#ec4899', // pink glow
    description: 'Ondas circulares expandem a partir do nó solto.',
  },
  {
    id: 'effect_confetti',
    name: 'Chuvas de Vitória',
    cost: 500,
    type: 'effect',
    value: 'confetti',
    previewColor: '#10b981', // emerald glow
    description: 'Fogos de artifício e confetes ao destravar uma fase.',
  },
];

const DEFAULT_STATS: GameStats = {
  levelsCompleted: 0,
  totalTimePlayed: 0,
  bestStreak: 0,
  currentStreak: 0,
  hintsUsed: 0,
  totalCoinsEarned: 0,
};

const DEFAULT_SETTINGS: GameSettings = {
  soundOn: true,
  hapticsOn: true,
  showTutorial: true,
};

const DEFAULT_STATE: SavedGameState = {
  currentLevelNumber: 1,
  coins: 0,
  stats: DEFAULT_STATS,
  settings: DEFAULT_SETTINGS,
  unlockedItemIds: ['theme_classic', 'rope_classic', 'effect_none'],
  equippedThemeId: 'theme_classic',
  equippedRopeId: 'rope_classic',
  equippedEffectId: 'effect_none',
};

/**
 * Loads the game state from localstorage.
 */
export function loadGameState(): SavedGameState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(serialized) as SavedGameState;
    // Merge structure to handle legacy saves if any
    return {
      ...DEFAULT_STATE,
      ...parsed,
      stats: { ...DEFAULT_STATS, ...parsed.stats },
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      unlockedItemIds: parsed.unlockedItemIds || DEFAULT_STATE.unlockedItemIds,
    };
  } catch (e) {
    console.error('Failed to load game state:', e);
    return DEFAULT_STATE;
  }
}

/**
 * Saves the game state to localstorage.
 */
export function saveGameState(state: SavedGameState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

/**
 * Reset local game data completely.
 */
export function resetGameData(): SavedGameState {
  saveGameState(DEFAULT_STATE);
  return DEFAULT_STATE;
}
