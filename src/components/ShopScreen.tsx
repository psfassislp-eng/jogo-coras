/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShoppingBag, ArrowLeft, Coins, Check, Lock, Sparkles, Eye } from 'lucide-react';
import { ShopItem, ThemeConfig, SavedGameState } from '../types';
import { SHOP_ITEMS } from '../storage/localStorage';
import { playSound } from '../audio/soundEffects';

interface ShopScreenProps {
  coins: number;
  gameState: SavedGameState;
  theme: ThemeConfig;
  onClose: () => void;
  onUpdateState: (newState: SavedGameState) => void;
}

export default function ShopScreen({
  coins,
  gameState,
  theme,
  onClose,
  onUpdateState,
}: ShopScreenProps) {
  const [activeTab, setActiveTab] = useState<'theme' | 'rope' | 'effect'>('theme');

  const filteredItems = SHOP_ITEMS.filter((item) => item.type === activeTab);

  const handleItemClick = (item: ShopItem) => {
    playSound('click');
    const isUnlocked = gameState.unlockedItemIds.includes(item.id);

    if (isUnlocked) {
      // Equip item
      const updatedState = { ...gameState };
      if (item.type === 'theme') {
        updatedState.equippedThemeId = item.id;
      } else if (item.type === 'rope') {
        updatedState.equippedRopeId = item.id;
      } else if (item.type === 'effect') {
        updatedState.equippedEffectId = item.id;
      }
      onUpdateState(updatedState);
    } else {
      // Try to buy
      if (coins >= item.cost) {
        const updatedState = {
          ...gameState,
          coins: coins - item.cost,
          unlockedItemIds: [...gameState.unlockedItemIds, item.id],
        };

        // Equip automatically after buying
        if (item.type === 'theme') {
          updatedState.equippedThemeId = item.id;
        } else if (item.type === 'rope') {
          updatedState.equippedRopeId = item.id;
        } else if (item.type === 'effect') {
          updatedState.equippedEffectId = item.id;
        }

        onUpdateState(updatedState);
        playSound('complete'); // play sweet unlocking sound!
      } else {
        playSound('error'); // play error buzz
        alert('Moedas insuficientes! Conclua mais fases para ganhar moedas.');
      }
    }
  };

  const isEquipped = (item: ShopItem): boolean => {
    if (item.type === 'theme') return gameState.equippedThemeId === item.id;
    if (item.type === 'rope') return gameState.equippedRopeId === item.id;
    if (item.type === 'effect') return gameState.equippedEffectId === item.id;
    return false;
  };

  return (
    <div className={`min-h-screen flex flex-col p-6 w-full max-w-lg mx-auto ${theme.text} select-none`}>
      {/* HUD Header */}
      <div className="flex justify-between items-center py-4">
        <button
          id="btn-shop-back"
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-cyan-400" />
          Loja Offline
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Coins className="w-4 h-4" />
          <span className="font-bold font-mono text-sm">{coins}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 my-4 bg-black/15 backdrop-blur-md rounded-xl border border-white/5">
        <button
          id="btn-tab-theme"
          onClick={() => {
            playSound('click');
            setActiveTab('theme');
          }}
          className={`py-2 px-3 rounded-lg font-bold font-display text-xs transition-all cursor-pointer ${
            activeTab === 'theme' ? 'bg-cyan-500 text-white shadow-lg' : 'opacity-60 hover:opacity-100'
          }`}
        >
          Temas
        </button>
        <button
          id="btn-tab-rope"
          onClick={() => {
            playSound('click');
            setActiveTab('rope');
          }}
          className={`py-2 px-3 rounded-lg font-bold font-display text-xs transition-all cursor-pointer ${
            activeTab === 'rope' ? 'bg-cyan-500 text-white shadow-lg' : 'opacity-60 hover:opacity-100'
          }`}
        >
          Cordas
        </button>
        <button
          id="btn-tab-effect"
          onClick={() => {
            playSound('click');
            setActiveTab('effect');
          }}
          className={`py-2 px-3 rounded-lg font-bold font-display text-xs transition-all cursor-pointer ${
            activeTab === 'effect' ? 'bg-cyan-500 text-white shadow-lg' : 'opacity-60 hover:opacity-100'
          }`}
        >
          Efeitos
        </button>
      </div>

      {/* Items Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-1">
        {filteredItems.map((item) => {
          const unlocked = gameState.unlockedItemIds.includes(item.id);
          const equipped = isEquipped(item);

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                equipped
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-400/5 scale-[1.01]'
                  : unlocked
                  ? 'bg-white/5 hover:bg-white/10 border-white/5'
                  : 'bg-white/[0.02] hover:bg-white/5 border-white/[0.03] opacity-80'
              }`}
            >
              {/* Item Info Block */}
              <div className="flex items-center gap-4.5 flex-1 pr-4">
                {/* Visual Circle Preview */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-inner"
                  style={{ backgroundColor: activeTab === 'theme' ? item.previewColor : 'rgba(0, 0, 0, 0.4)' }}
                >
                  {activeTab === 'rope' && (
                    <div
                      className="w-8 h-2 rounded-full"
                      style={{
                        backgroundColor: item.previewColor,
                        border: item.id === 'rope_double' ? '1px solid rgba(255,255,255,0.4)' : 'none',
                        boxShadow: item.id === 'rope_glow' ? `0 0 10px ${item.previewColor}` : 'none',
                        backgroundImage: item.id === 'rope_sisal' ? 'radial-gradient(circle, rgba(0,0,0,0.2) 20%, transparent 20%)' : 'none',
                        backgroundSize: '4px 4px',
                      }}
                    />
                  )}
                  {activeTab === 'effect' && (
                    <Sparkles
                      className="w-6 h-6"
                      style={{ color: item.id !== 'effect_none' ? item.previewColor : '#94a3b8' }}
                    />
                  )}
                  {activeTab === 'theme' && (
                    <Eye className="w-5 h-5 text-white/80 drop-shadow" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="font-bold font-display text-sm flex items-center gap-1.5">
                    {item.name}
                    {equipped && (
                      <span className="text-[10px] bg-cyan-500 text-white font-mono px-1.5 py-0.5 rounded-md leading-none uppercase">
                        Uso
                      </span>
                    )}
                  </span>
                  <span className="text-xs opacity-60 font-sans mt-0.5 max-w-[180px] leading-snug">
                    {item.description}
                  </span>
                </div>
              </div>

              {/* Status/Purchase Block */}
              <div>
                {equipped ? (
                  <div className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : unlocked ? (
                  <button className="py-1.5 px-3 rounded-lg font-bold text-xs bg-white/10 hover:bg-white/15 border border-white/5 transition-all">
                    Equipar
                  </button>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-sm font-bold">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.cost}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint info bar */}
      <div className="mt-4 p-4 rounded-2xl bg-black/10 border border-white/5 text-xs flex items-center gap-2">
        <span className="text-base">💡</span>
        <p className="opacity-60 leading-normal">
          Para ganhar moedas, jogue nos níveis mais altos ou tente resolver de forma eficiente com poucos movimentos!
        </p>
      </div>
    </div>
  );
}
