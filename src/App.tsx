/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  RotateCcw,
  Lightbulb,
  Pause,
  Play,
  ArrowLeft,
  Volume2,
  VolumeX,
  Coins,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  X,
  RefreshCw,
  Home,
  ShoppingBag,
  Settings
} from 'lucide-react';

import { Level, GameNode, GameEdge, SavedGameState, Difficulty } from './types';
import { generateLevel } from './level_generator/generator';
import { updateEdgeIntersections } from './engine/geometry';
import { calculateHint, HintResult } from './game_logic/hint';
import { loadGameState, saveGameState, resetGameData } from './storage/localStorage';
import { THEME_CONFIGS, ROPE_CONFIGS, PARTICLE_CONFIGS } from './engine/themes';
import { playSound, setSoundEnabled } from './audio/soundEffects';

import StartScreen from './components/StartScreen';
import GameBoard from './components/GameBoard';
import ShopScreen from './components/ShopScreen';
import StatsScreen from './components/StatsScreen';
import SettingsScreen from './components/SettingsScreen';
import TutorialOverlay from './components/TutorialOverlay';

export default function App() {
  // Load initial persistent game state
  const [gameState, setGameState] = useState<SavedGameState>(() => loadGameState());
  const [activeScreen, setActiveScreen] = useState<'start' | 'game' | 'shop' | 'stats' | 'settings'>('start');

  // Active Level state
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [crossingsCount, setCrossingsCount] = useState<number>(0);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Hints
  const [activeHint, setActiveHint] = useState<HintResult | null>(null);

  // Modals / Overlays
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Time tracker ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync sound settings with audio engine
  useEffect(() => {
    setSoundEnabled(gameState.settings.soundOn);
  }, [gameState.settings.soundOn]);

  // Load level on start
  const handleStartGame = (levelNumber: number) => {
    playSound('click');
    const level = generateLevel(levelNumber);
    setCurrentLevel(level);

    // Initial crossings evaluation
    const { intersectionCount } = updateEdgeIntersections(level.nodes, level.edges);
    setCrossingsCount(intersectionCount);

    setMovesCount(0);
    setTimeSpent(0);
    setActiveHint(null);
    setIsVictoryOpen(false);
    setIsPaused(false);
    setActiveScreen('game');

    // Show tutorial if enabled and level 1
    if (levelNumber === 1 && gameState.settings.showTutorial) {
      setShowTutorial(true);
    }
  };

  // Restart current level
  const handleRestartLevel = () => {
    if (!currentLevel) return;
    handleStartGame(currentLevel.levelNumber);
  };

  // Timer loop for tracking seconds played
  useEffect(() => {
    if (activeScreen === 'game' && !isPaused && !isVictoryOpen && !showTutorial) {
      timerRef.current = setInterval(() => {
        setTimeSpent((t) => t + 1);
        
        // Accumulate total play time in stats
        const updatedState = { ...gameState };
        updatedState.stats.totalTimePlayed += 1;
        setGameState(updatedState);
        saveGameState(updatedState);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeScreen, isPaused, isVictoryOpen, showTutorial, gameState]);

  // Handle live node drag positioning updates (high performance, called during mousemove/touchmove)
  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    if (!currentLevel || isPaused || isVictoryOpen) return;

    const updatedNodes = currentLevel.nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, x, y };
      }
      return node;
    });

    const { updatedEdges, intersectionCount } = updateEdgeIntersections(updatedNodes, currentLevel.edges);

    setCurrentLevel({
      ...currentLevel,
      nodes: updatedNodes,
      edges: updatedEdges,
    });
    setCrossingsCount(intersectionCount);
  };

  // Handle drag release
  const handleNodeRelease = (nodeId: string, endX: number, endY: number) => {
    setMovesCount((m) => m + 1);

    // If we just solved the puzzle (0 crossings)
    if (crossingsCount === 0 && currentLevel && !isVictoryOpen) {
      triggerLevelVictory();
    }
  };

  // Level Complete Routine
  const triggerLevelVictory = () => {
    if (!currentLevel) return;
    setIsVictoryOpen(true);

    // Calculate coin rewards
    let rewardCoins = 10; // Easy fallback
    if (currentLevel.difficulty === 'medium') rewardCoins = 20;
    else if (currentLevel.difficulty === 'hard') rewardCoins = 40;
    else if (currentLevel.difficulty === 'master') rewardCoins = 80;

    // Additional bonus for efficiency (under 10 moves or very fast)
    const efficiencyBonus = movesCount < currentLevel.nodes.length * 1.5 ? 5 : 0;
    const finalCoinsEarned = rewardCoins + efficiencyBonus;

    // Update persistent state
    const nextLevelNum = currentLevel.levelNumber + 1;
    const updatedStats = {
      ...gameState.stats,
      levelsCompleted: gameState.stats.levelsCompleted + 1,
      totalCoinsEarned: gameState.stats.totalCoinsEarned + finalCoinsEarned,
      currentStreak: gameState.stats.currentStreak + 1,
      bestStreak: Math.max(gameState.stats.bestStreak, gameState.stats.currentStreak + 1),
    };

    const updatedState: SavedGameState = {
      ...gameState,
      currentLevelNumber: nextLevelNum,
      coins: gameState.coins + finalCoinsEarned,
      stats: updatedStats,
    };

    setGameState(updatedState);
    saveGameState(updatedState);

    // Play triumphant fanfarre
    playSound('victory');
  };

  // Advance to next procedural level
  const handleNextLevel = () => {
    if (!currentLevel) return;
    handleStartGame(currentLevel.levelNumber + 1);
  };

  // Request interactive hint
  const handleUseHint = () => {
    if (!currentLevel || crossingsCount === 0 || isPaused) return;

    playSound('click');
    const hint = calculateHint(currentLevel.nodes, currentLevel.edges);

    if (hint) {
      setActiveHint(hint);
      
      // Accumulate stats
      const updatedState = {
        ...gameState,
        stats: {
          ...gameState.stats,
          hintsUsed: gameState.stats.hintsUsed + 1,
        },
      };
      setGameState(updatedState);
      saveGameState(updatedState);

      // Play sound and clear hint after 4 seconds to avoid overlay clutters
      setTimeout(() => {
        setActiveHint(null);
      }, 4500);
    }
  };

  // Reset entire game database
  const handleFullReset = () => {
    const defaultState = resetGameData();
    setGameState(defaultState);
    setActiveScreen('start');
  };

  // Clean local stats only
  const handleResetStats = () => {
    const updatedState = {
      ...gameState,
      stats: {
        levelsCompleted: 0,
        totalTimePlayed: 0,
        bestStreak: 0,
        currentStreak: 0,
        hintsUsed: 0,
        totalCoinsEarned: 0,
      },
    };
    setGameState(updatedState);
    saveGameState(updatedState);
  };

  // Theme settings and shop config lookups
  const themeId = gameState.equippedThemeId.replace('theme_', '');
  const activeTheme = THEME_CONFIGS[themeId] || THEME_CONFIGS.classic;

  const ropeId = gameState.equippedRopeId.replace('rope_', '');
  const activeRope = ROPE_CONFIGS[ropeId] || ROPE_CONFIGS.classic;

  const effectId = gameState.equippedEffectId.replace('effect_', '');
  const activeEffect = PARTICLE_CONFIGS[effectId] || PARTICLE_CONFIGS.none;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 overflow-hidden bg-[#05050a] ${activeTheme.text} relative`}>
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Dynamic Glow 1 using activeTheme.primary */}
        <div 
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-all duration-500 opacity-60"
          style={{ backgroundColor: `${activeTheme.primary}15` }}
        />
        {/* Dynamic Glow 2 using activeTheme.secondary or accent */}
        <div 
          className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[120px] transition-all duration-500 opacity-60"
          style={{ backgroundColor: `${activeTheme.secondary || activeTheme.accent}15` }}
        />
        {/* Subtle Star/Dot grid pattern exactly as in Immersive UI */}
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)', 
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- START MENU SCREEN --- */}
        {activeScreen === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full relative z-10"
          >
            <StartScreen
              currentLevelNumber={gameState.currentLevelNumber}
              coins={gameState.coins}
              theme={activeTheme}
              onPlay={() => handleStartGame(1)} // New Game starting at level 1
              onContinue={() => handleStartGame(gameState.currentLevelNumber)} // Continue level
              onOpenShop={() => { playSound('click'); setActiveScreen('shop'); }}
              onOpenStats={() => { playSound('click'); setActiveScreen('stats'); }}
              onOpenSettings={() => { playSound('click'); setActiveScreen('settings'); }}
            />
          </motion.div>
        )}

        {/* --- GAME INTERFACE SCREEN --- */}
        {activeScreen === 'game' && currentLevel && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col justify-between w-full max-w-5xl mx-auto px-4 md:px-10 py-6 select-none relative z-10"
          >
            {/* Top Navigation HUD / Progress Header */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 md:h-24 z-10">
              <div className="flex items-center gap-4">
                <button
                  id="btn-hud-back"
                  onClick={() => {
                    playSound('click');
                    setActiveScreen('start');
                  }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 cursor-pointer text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold mb-1">
                    Current Challenge / Desafio Atual
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
                    LEVEL {currentLevel.levelNumber}{' '}
                    <span className="text-slate-500 font-medium ml-2 text-xl sm:text-2xl">/ 100</span>
                  </h1>
                </div>
              </div>

              {/* Stats & Progress indicators on the right */}
              <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                <div className="flex flex-wrap gap-2.5 sm:gap-4 mb-3 w-full sm:w-auto justify-start sm:justify-end">
                  {/* Crossings Indicator with dynamic glow */}
                  <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm">
                    <div 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        crossingsCount > 0 
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' 
                          : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      }`} 
                    />
                    <span className="text-xs sm:text-sm font-mono tracking-wider text-slate-200 uppercase">
                      {crossingsCount} {crossingsCount === 1 ? 'Cruzamento' : 'Cruzamentos'}
                    </span>
                  </div>

                  {/* Moedas/Coins/Money Indicator */}
                  <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm">
                    <span className="text-amber-400 text-sm sm:text-base font-black">$</span>
                    <span className="text-xs sm:text-sm font-mono tracking-wider text-slate-200">
                      {gameState.coins}
                    </span>
                  </div>

                  {/* Audio trigger toggle */}
                  <button
                    id="btn-hud-sound"
                    onClick={() => {
                      playSound('click');
                      const updated = {
                        ...gameState,
                        settings: { ...gameState.settings, soundOn: !gameState.settings.soundOn },
                      };
                      setGameState(updated);
                      saveGameState(updated);
                    }}
                    className="flex items-center justify-center rounded-full bg-black/40 border border-white/5 text-cyan-400 hover:bg-white/5 backdrop-blur-sm cursor-pointer w-8 h-8 self-center"
                  >
                    {gameState.settings.soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                  </button>
                </div>

                {/* Progress bar styled with cyan/blue gradient and shadow */}
                {(() => {
                  const totalEdges = currentLevel.edges.length;
                  const solvedEdges = totalEdges - crossingsCount;
                  const solvedPercent = totalEdges > 0 ? Math.max(0, Math.min(100, (solvedEdges / totalEdges) * 100)) : 100;
                  return (
                    <div className="w-full sm:w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500"
                        style={{ width: `${solvedPercent}%` }}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Workspace & Board Canvas Wrapper */}
            <div className="flex-1 relative flex flex-col md:flex-row items-center justify-center p-4 md:p-12 min-h-[400px] w-full z-10">
              
              {/* GAME CORE BOARD CANVAS */}
              <div className="w-full max-w-[500px] flex items-center justify-center">
                <GameBoard
                  nodes={currentLevel.nodes}
                  edges={currentLevel.edges}
                  theme={activeTheme}
                  ropeConfig={activeRope}
                  effectConfig={activeEffect}
                  hintedNodeId={activeHint?.type === 'node' ? activeHint.targetId : undefined}
                  hintedEdgeId={activeHint?.type === 'edge' ? activeHint.targetId : undefined}
                  onNodeMove={handleNodeMove}
                  onNodeRelease={handleNodeRelease}
                />
              </div>

              {/* Right Sidebar Actions (Floats on desktop) */}
              <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-6 z-20">
                {/* Restart Button */}
                <button
                  id="btn-sidebar-restart"
                  title="Reiniciar Nível"
                  onClick={handleRestartLevel}
                  className="w-16 h-16 bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center rounded-2xl group transition-all cursor-pointer hover:border-cyan-500/50 hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-7 h-7 text-slate-400 group-hover:text-white transition-transform group-hover:rotate-45 duration-300" />
                </button>

                {/* Hint Button */}
                <button
                  id="btn-sidebar-hint"
                  title="Dica Esperta"
                  onClick={handleUseHint}
                  disabled={crossingsCount === 0}
                  className={`w-16 h-16 flex items-center justify-center rounded-2xl group transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    crossingsCount === 0
                      ? 'opacity-30 cursor-not-allowed bg-stone-800/20 border border-white/5'
                      : 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                  }`}
                >
                  <Lightbulb className="w-7 h-7 fill-white/10 group-hover:scale-110 transition-transform" />
                </button>

                {/* Pause Button */}
                <button
                  id="btn-sidebar-pause"
                  title="Pausar"
                  onClick={() => {
                    playSound('click');
                    setIsPaused(true);
                  }}
                  className="w-16 h-16 bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center rounded-2xl group transition-all cursor-pointer hover:border-cyan-500/50 hover:scale-105 active:scale-95"
                >
                  <Pause className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Mobile Quick Action Buttons Bar (Shown only on small screens) */}
              <div className="flex md:hidden gap-4 mt-6 w-full max-w-sm justify-center z-10">
                <button
                  id="btn-mobile-restart"
                  onClick={handleRestartLevel}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs font-display tracking-wide uppercase transition-all text-slate-300"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  Reiniciar
                </button>
                <button
                  id="btn-mobile-hint"
                  onClick={handleUseHint}
                  disabled={crossingsCount === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs font-display tracking-wide uppercase transition-all ${
                    crossingsCount === 0
                      ? 'opacity-30 cursor-not-allowed bg-stone-800/10 border border-white/5 text-slate-500'
                      : 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-400'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 fill-white/10" />
                  Dica
                </button>
              </div>

              {/* Hint Bouncing Badge */}
              {activeHint && (
                <div className="absolute bottom-16 sm:bottom-2 md:bottom-1 left-0 sm:left-4 md:left-10 z-25 flex items-center gap-3 animate-bounce max-w-[90%] md:max-w-md">
                  <div className="w-10 h-10 min-w-[40px] bg-amber-500 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/40">
                    !
                  </div>
                  <div className="bg-black/80 border border-amber-500/35 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-xl text-left">
                    <p className="text-xs text-amber-200 leading-normal font-sans font-medium">
                      {activeHint.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Toolbar */}
            <div className="w-full bg-black/40 backdrop-blur-md border border-white/5 flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 md:px-10 h-auto sm:h-28 z-20 rounded-3xl md:rounded-b-none mt-4 gap-4 sm:gap-0">
              <div className="flex gap-8 sm:gap-10 w-full sm:w-auto justify-around sm:justify-start">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Complexity</span>
                  <span className="text-lg sm:text-xl font-bold text-slate-200 uppercase">
                    {currentLevel.difficulty === 'easy' ? 'FÁCIL' : currentLevel.difficulty === 'medium' ? 'MÉDIO' : currentLevel.difficulty === 'hard' ? 'DIFÍCIL' : 'MESTRE'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Time Elapsed</span>
                  <span className="text-lg sm:text-xl font-mono text-slate-200">
                    {Math.floor(timeSpent / 60).toString().padStart(2, '0')}:{(timeSpent % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Movimentos</span>
                  <span className="text-lg sm:text-xl font-mono text-cyan-400 font-bold">
                    {movesCount}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  id="btn-toolbar-boutique"
                  onClick={() => {
                    playSound('click');
                    setActiveScreen('shop');
                  }}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2.5 text-xs font-bold font-display uppercase tracking-widest text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  Boutique
                </button>
                <button
                  id="btn-toolbar-settings"
                  onClick={() => {
                    playSound('click');
                    setActiveScreen('settings');
                  }}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2.5 text-xs font-bold font-display uppercase tracking-widest text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Ajustes
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- SHOP SCREEN --- */}
        {activeScreen === 'shop' && (
          <motion.div
            key="shop"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full relative z-10"
          >
            <ShopScreen
              coins={gameState.coins}
              gameState={gameState}
              theme={activeTheme}
              onClose={() => setActiveScreen('start')}
              onUpdateState={(state) => {
                setGameState(state);
                saveGameState(state);
              }}
            />
          </motion.div>
        )}

        {/* --- STATS SCREEN --- */}
        {activeScreen === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full relative z-10"
          >
            <StatsScreen
              stats={gameState.stats}
              theme={activeTheme}
              onClose={() => setActiveScreen('start')}
              onResetStats={handleResetStats}
            />
          </motion.div>
        )}

        {/* --- SETTINGS SCREEN --- */}
        {activeScreen === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full relative z-10"
          >
            <SettingsScreen
              settings={gameState.settings}
              theme={activeTheme}
              onClose={() => setActiveScreen('start')}
              onUpdateSettings={(settings) => {
                const updated = { ...gameState, settings };
                setGameState(updated);
                saveGameState(updated);
              }}
              onFullReset={handleFullReset}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VICTORY/LEVEL COMPLETE OVERLAY MODAL --- */}
      <AnimatePresence>
        {isVictoryOpen && currentLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl p-6 text-center space-y-6 shadow-2xl ${activeTheme.cardBg} ${activeTheme.text}`}
            >
              <div className="flex flex-col items-center">
                {/* Shiny cup badge */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white mb-2 shadow-xl shadow-amber-500/20">
                  <Award className="w-9 h-9 animate-[bounce_1.5s_infinite]" />
                </div>
                <h3 className="text-2xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400">
                  Fase Resolvida!
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-wider opacity-60 mt-0.5">
                  Nível {currentLevel.levelNumber} Concluído
                </p>
              </div>

              {/* Victory Stats Grid */}
              <div className="grid grid-cols-2 gap-3 bg-black/25 p-4 rounded-2xl border border-white/5 text-left font-sans">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] opacity-40 uppercase leading-none font-mono">Ganhos</span>
                    <span className="text-sm font-bold font-mono text-amber-400">
                      +{currentLevel.difficulty === 'easy' ? 10 : currentLevel.difficulty === 'medium' ? 20 : currentLevel.difficulty === 'hard' ? 40 : 80} Moedas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] opacity-40 uppercase leading-none font-mono">Tempo</span>
                    <span className="text-sm font-bold font-mono text-cyan-300">
                      {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 col-span-2 border-t border-white/5 pt-3 mt-1 justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs opacity-60">Movimentos Efetuados:</span>
                  </div>
                  <span className="text-sm font-black font-display text-white">{movesCount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  id="btn-victory-next"
                  onClick={handleNextLevel}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black font-display text-base bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Próxima Fase
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  id="btn-victory-home"
                  onClick={() => {
                    playSound('click');
                    setIsVictoryOpen(false);
                    setActiveScreen('start');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/5 transition-all opacity-60 hover:opacity-100"
                >
                  <Home className="w-4 h-4" />
                  Voltar ao Menu Principal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- IN-GAME PAUSE MODAL OVERLAY --- */}
      <AnimatePresence>
        {isPaused && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md select-none">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl p-6 text-center space-y-6 shadow-2xl ${activeTheme.cardBg} ${activeTheme.text}`}
            >
              <h3 className="text-2xl font-black font-display tracking-tight">Jogo Pausado</h3>

              <div className="space-y-3">
                <button
                  id="btn-pause-resume"
                  onClick={() => {
                    playSound('click');
                    setIsPaused(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold font-display text-sm bg-cyan-500 text-white shadow-lg cursor-pointer"
                >
                  <Play className="w-4.5 h-4.5 fill-white" />
                  Retomar Jogo
                </button>

                <button
                  id="btn-pause-restart"
                  onClick={() => {
                    playSound('click');
                    setIsPaused(false);
                    handleRestartLevel();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold font-display text-sm bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                  Reiniciar Fase
                </button>

                <button
                  id="btn-pause-menu"
                  onClick={() => {
                    playSound('click');
                    setIsPaused(false);
                    setActiveScreen('start');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold font-display text-sm bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                >
                  <Home className="w-4.5 h-4.5" />
                  Menu Principal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- IN-GAME TUTORIAL MODAL OVERLAY --- */}
      {showTutorial && (
        <TutorialOverlay
          theme={activeTheme}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}
