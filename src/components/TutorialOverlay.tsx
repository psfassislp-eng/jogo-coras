/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { HelpCircle, Check, HelpCircleIcon } from 'lucide-react';
import { ThemeConfig } from '../types';
import { playSound } from '../audio/soundEffects';

interface TutorialOverlayProps {
  theme: ThemeConfig;
  onClose: () => void;
}

export default function TutorialOverlay({ theme, onClose }: TutorialOverlayProps) {
  const handleClose = () => {
    playSound('click');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md select-none animate-fade-in">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-sm rounded-3xl p-6 ${theme.cardBg} ${theme.text} space-y-5 text-center shadow-2xl`}
      >
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold font-display tracking-tight">Como Jogar?</h3>
          <p className="text-xs opacity-65 font-sans mt-1">Regras simples de desembaraçar nós</p>
        </div>

        {/* Step List */}
        <div className="space-y-3.5 text-left text-xs font-sans leading-relaxed">
          <div className="flex gap-3.5 items-start">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold font-mono text-[10px] shrink-0 mt-0.5">1</span>
            <p>
              Arraste os <strong className="text-cyan-400 font-semibold font-display">nós redondos</strong> para qualquer ponto da arena de jogo.
            </p>
          </div>

          <div className="flex gap-3.5 items-start">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 font-bold font-mono text-[10px] shrink-0 mt-0.5">2</span>
            <p>
              Cordas de cor <strong className="text-rose-400 font-semibold font-display">vermelha</strong> estão cruzando umas com as outras.
            </p>
          </div>

          <div className="flex gap-3.5 items-start">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px] shrink-0 mt-0.5">3</span>
            <p>
              Cordas de cor <strong className="text-emerald-400 font-semibold font-display">verde/ciano</strong> estão livres de cruzamento!
            </p>
          </div>

          <div className="flex gap-3.5 items-start">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-bold font-mono text-[10px] shrink-0 mt-0.5">4</span>
            <p>
              A fase termina quando <strong className="text-yellow-400 font-semibold font-display">todos os cruzamentos</strong> forem eliminados!
            </p>
          </div>
        </div>

        {/* Drag Animation helper mockup */}
        <div className="relative h-20 bg-black/25 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
          {/* Mock nodes & lines */}
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 80">
            <line x1="30" y1="40" x2="170" y2="40" stroke="#ef4444" strokeWidth="2" />
            <line x1="100" y1="15" x2="100" y2="65" stroke="#ef4444" strokeWidth="2" />
            <circle cx="30" cy="40" r="4" fill="#fff" stroke="#00ffff" />
            <circle cx="170" cy="40" r="4" fill="#fff" stroke="#00ffff" />
            <circle cx="100" cy="15" r="4" fill="#fff" stroke="#00ffff" />
            <circle cx="100" cy="65" r="4" fill="#fff" stroke="#00ffff" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[10px] font-mono font-bold uppercase opacity-80 tracking-wider flex flex-col items-center gap-1.5">
            <span>Arraste os nós</span>
            <div className="w-5 h-5 rounded-full border border-white bg-white/20 animate-ping" />
          </div>
        </div>

        <button
          id="btn-tutorial-close"
          onClick={handleClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold font-display text-sm hover:opacity-95 transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          Entendi, vamos jogar!
        </button>
      </motion.div>
    </div>
  );
}
