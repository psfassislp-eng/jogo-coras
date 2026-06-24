/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Play, RotateCcw, ShoppingBag, BarChart3, Settings, Sparkles, AlertCircle } from 'lucide-react';
import { ThemeConfig } from '../types';

interface StartScreenProps {
  currentLevelNumber: number;
  coins: number;
  theme: ThemeConfig;
  onPlay: () => void;
  onContinue: () => void;
  onOpenShop: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export default function StartScreen({
  currentLevelNumber,
  coins,
  theme,
  onPlay,
  onContinue,
  onOpenShop,
  onOpenStats,
  onOpenSettings,
}: StartScreenProps) {
  return (
    <div className={`flex flex-col items-center justify-between min-h-screen p-6 w-full max-w-lg mx-auto ${theme.text} select-none`}>
      {/* Header Info */}
      <div className="w-full flex justify-between items-center pt-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5">
          <span className="text-xs font-mono uppercase opacity-60">Nível</span>
          <span className="font-bold font-display text-lg">{currentLevelNumber}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span className="font-bold font-mono text-base">{coins}</span>
        </div>
      </div>

      {/* Main Branding Card */}
      <div className="flex-1 flex flex-col items-center justify-center my-8 w-full">
        {/* Animated Rope Logo */}
        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
          {/* Circular vector animation */}
          <svg className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
            {/* Background circle ropes */}
            <circle cx="50" cy="50" r="32" fill="none" stroke={theme.secondary} strokeWidth="1.5" strokeDasharray="4, 4" className="opacity-40" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={theme.primary} strokeWidth="2" strokeDasharray="10, 6" className="opacity-60" />
            
            {/* Star knot */}
            <path d="M 50 10 L 80 75 L 15 35 L 85 35 L 20 75 Z" fill="none" stroke={theme.edgeNormal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          
          {/* Center node indicator */}
          <div className="z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border-2 border-white flex items-center justify-center shadow-lg">
            <span className="text-2xl">🪢</span>
          </div>

          {/* Floating nodes */}
          <div className="absolute top-4 left-6 w-4 h-4 rounded-full bg-white border border-cyan-400 shadow-md animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-6 right-4 w-5 h-5 rounded-full bg-white border border-purple-500 shadow-md animate-pulse" style={{ animationDelay: '0.7s' }} />
          <div className="absolute bottom-4 left-10 w-3 h-3 rounded-full bg-white border border-rose-500 shadow-md" />
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-center select-none mb-2">
            Desembaraçar<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 font-extrabold">
              Cordas
            </span>
          </h1>
          <p className="text-sm font-sans max-w-xs mx-auto opacity-70 mt-1">
            Mova os nós e desfaça os cruzamentos das cordas de forma estratégica!
          </p>
        </motion.div>
      </div>

      {/* Navigation Buttons Block */}
      <div className="w-full flex flex-col gap-4 mb-8">
        {currentLevelNumber > 1 ? (
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              id="btn-continue"
              onClick={onContinue}
              className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold font-display text-base bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              Continuar
            </button>
            <button
              id="btn-restart"
              onClick={onPlay}
              className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold font-display text-base bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Novo Jogo
            </button>
          </div>
        ) : (
          <button
            id="btn-play-new"
            onClick={onPlay}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black font-display text-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 text-white shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            Iniciar Jogo
          </button>
        )}

        {/* Secondary Menu */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <button
            id="btn-shop"
            onClick={onOpenShop}
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold font-display">Loja</span>
          </button>

          <button
            id="btn-stats"
            onClick={onOpenStats}
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
          >
            <BarChart3 className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold font-display">Status</span>
          </button>

          <button
            id="btn-settings"
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
          >
            <Settings className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold font-display">Ajustes</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full flex flex-col items-center justify-center opacity-40 text-[10px] font-mono gap-1 mb-2">
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Jogo de Quebra-Cabeça Offline
        </span>
        <span>Funciona 100% Sem Internet • Licença Apache-2.0</span>
      </div>
    </div>
  );
}
