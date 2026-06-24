/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart3, ArrowLeft, RotateCcw, Award, Clock, Coins, Flame, Lightbulb, TrendingUp } from 'lucide-react';
import { GameStats, ThemeConfig } from '../types';
import { playSound } from '../audio/soundEffects';

interface StatsScreenProps {
  stats: GameStats;
  theme: ThemeConfig;
  onClose: () => void;
  onResetStats: () => void;
}

export default function StatsScreen({
  stats,
  theme,
  onClose,
  onResetStats,
}: StatsScreenProps) {
  // Format seconds to a readable hh:mm:ss string
  const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '0s';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);

    return parts.join(' ');
  };

  const handleResetClick = () => {
    playSound('error');
    const confirmReset = window.confirm(
      'Deseja realmente limpar todas as suas estatísticas de jogo? Isso apagará seu histórico de forma permanente!'
    );
    if (confirmReset) {
      onResetStats();
      alert('Estatísticas redefinidas com sucesso!');
    }
  };

  // Milestone check
  const getRank = (completed: number) => {
    if (completed >= 100) return 'Grande Mestre das Cordas 🌌';
    if (completed >= 50) return 'Especialista em Nós 🧶';
    if (completed >= 25) return 'Entusiasta de Laços 🪢';
    if (completed >= 10) return 'Iniciante Curioso 🔍';
    return 'Novato do Desembaraço 🌱';
  };

  return (
    <div className={`min-h-screen flex flex-col p-6 w-full max-w-lg mx-auto ${theme.text} select-none`}>
      {/* Header */}
      <div className="flex justify-between items-center py-4">
        <button
          id="btn-stats-back"
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Estatísticas Offline
        </h2>
        <div className="w-11" /> {/* Balanced spacer */}
      </div>

      {/* Main rank badge card */}
      <div className="my-4 p-5 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-white/10 flex flex-col items-center text-center shadow-lg">
        <Award className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
        <span className="text-xs uppercase tracking-widest opacity-60 font-mono">Rank de Desembaraço</span>
        <h3 className="text-lg font-black font-display mt-1">{getRank(stats.levelsCompleted)}</h3>
        <p className="text-xs opacity-50 mt-1 font-sans">Avanço automático de classe conforme resolve os nós.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto no-scrollbar py-2">
        {/* Stat 1: Completed Levels */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1.5 shadow-sm">
          <div className="flex justify-between items-center text-cyan-400">
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase opacity-50">Milestone</span>
          </div>
          <span className="text-2xl font-black font-display mt-1">{stats.levelsCompleted}</span>
          <span className="text-xs text-stone-400/80 font-sans">Fases Concluídas</span>
        </div>

        {/* Stat 2: Total Time Played */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1.5 shadow-sm">
          <div className="flex justify-between items-center text-indigo-400">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase opacity-50">Atividade</span>
          </div>
          <span className="text-2xl font-black font-display mt-1 truncate">{formatTime(stats.totalTimePlayed)}</span>
          <span className="text-xs text-stone-400/80 font-sans">Tempo de Jogo</span>
        </div>

        {/* Stat 3: Best Streak */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1.5 shadow-sm">
          <div className="flex justify-between items-center text-rose-500">
            <Flame className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase opacity-50">Max Combo</span>
          </div>
          <span className="text-2xl font-black font-display mt-1">{stats.bestStreak}</span>
          <span className="text-xs text-stone-400/80 font-sans">Melhor Sequência</span>
        </div>

        {/* Stat 4: Current Streak */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1.5 shadow-sm">
          <div className="flex justify-between items-center text-amber-500">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase opacity-50">Ativo</span>
          </div>
          <span className="text-2xl font-black font-display mt-1">{stats.currentStreak}</span>
          <span className="text-xs text-stone-400/80 font-sans">Sequência Atual</span>
        </div>

        {/* Stat 5: Total Coins Earned */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1.5 shadow-sm">
          <div className="flex justify-between items-center text-yellow-400">
            <Coins className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase opacity-50">Finanças</span>
          </div>
          <span className="text-2xl font-black font-display mt-1">{stats.totalCoinsEarned}</span>
          <span className="text-xs text-stone-400/80 font-sans">Moedas Conquistadas</span>
        </div>

        {/* Stat 6: Hints Used */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1.5 shadow-sm">
          <div className="flex justify-between items-center text-emerald-400">
            <Lightbulb className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase opacity-50">Suporte</span>
          </div>
          <span className="text-2xl font-black font-display mt-1">{stats.hintsUsed}</span>
          <span className="text-xs text-stone-400/80 font-sans">Dicas Solicitadas</span>
        </div>
      </div>

      {/* Clear Statistics Button */}
      <div className="mt-4 flex flex-col gap-3">
        <button
          id="btn-clear-stats"
          onClick={handleResetClick}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold font-display text-sm border border-red-500/20 text-red-400 hover:bg-red-500/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Limpar Conquistas e Status
        </button>
      </div>
    </div>
  );
}
