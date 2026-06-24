/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowLeft, Settings, Volume2, VolumeX, Smartphone, RefreshCw, HelpCircle, FileText, SmartphoneIcon } from 'lucide-react';
import { GameSettings, ThemeConfig } from '../types';
import { playSound } from '../audio/soundEffects';

interface SettingsScreenProps {
  settings: GameSettings;
  theme: ThemeConfig;
  onClose: () => void;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onFullReset: () => void;
}

export default function SettingsScreen({
  settings,
  theme,
  onClose,
  onUpdateSettings,
  onFullReset,
}: SettingsScreenProps) {
  const toggleSound = () => {
    playSound('click');
    onUpdateSettings({ ...settings, soundOn: !settings.soundOn });
  };

  const toggleHaptics = () => {
    playSound('click');
    onUpdateSettings({ ...settings, hapticsOn: !settings.hapticsOn });
  };

  const toggleTutorial = () => {
    playSound('click');
    onUpdateSettings({ ...settings, showTutorial: !settings.showTutorial });
  };

  const handleFullReset = () => {
    playSound('error');
    const confirmReset = window.confirm(
      'CUIDADO: Isso irá apagar todo o seu progresso, nível atual, moedas acumuladas e itens comprados na loja de forma irreversível! Deseja mesmo reiniciar tudo?'
    );
    if (confirmReset) {
      onFullReset();
      alert('Todos os dados de jogo foram redefinidos para o padrão de fábrica!');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col p-6 w-full max-w-lg mx-auto ${theme.text} select-none`}>
      {/* Header */}
      <div className="flex justify-between items-center py-4">
        <button
          id="btn-settings-back"
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Ajustes Gerais
        </h2>
        <div className="w-11" />
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 py-4">
        {/* Toggle Sound */}
        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              {settings.soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-zinc-500" />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold font-display text-sm">Sons e Áudio</span>
              <span className="text-xs opacity-60 font-sans">Efeitos sonoros e cliques</span>
            </div>
          </div>
          <button
            id="toggle-sound"
            onClick={toggleSound}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              settings.soundOn ? 'bg-cyan-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${
                settings.soundOn ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle Haptics */}
        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold font-display text-sm">Vibração Simulada</span>
              <span className="text-xs opacity-60 font-sans">Efeito tátil ao arrastar os nós</span>
            </div>
          </div>
          <button
            id="toggle-haptics"
            onClick={toggleHaptics}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              settings.hapticsOn ? 'bg-cyan-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${
                settings.hapticsOn ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle Tutorial */}
        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold font-display text-sm">Guia de Tutorial</span>
              <span className="text-xs opacity-60 font-sans">Exibir dicas de ajuda na fase 1</span>
            </div>
          </div>
          <button
            id="toggle-tutorial"
            onClick={toggleTutorial}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              settings.showTutorial ? 'bg-cyan-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${
                settings.showTutorial ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* APK Compilation Card */}
        <div className="p-5 rounded-2xl bg-black/15 border border-white/5 space-y-3.5">
          <h3 className="font-bold font-display text-sm flex items-center gap-2 text-amber-400">
            <SmartphoneIcon className="w-5 h-5" />
            Compilação APK para Android
          </h3>
          <p className="text-xs opacity-75 leading-relaxed font-sans">
            Como este jogo é desenvolvido utilizando <strong>HTML5 + React + Vite</strong> e é 100% independente de APIs ou servidores externos, ele pode ser compilado para um aplicativo Android (.apk) nativo e offline usando o <strong>Capacitor</strong>:
          </p>
          <ol className="text-xs font-mono space-y-2 opacity-85 list-decimal list-inside pl-1">
            <li>No terminal do projeto, instale o Capacitor:<br />
              <code className="text-cyan-300 block my-1 pl-4">npm i @capacitor/core @capacitor/cli</code>
            </li>
            <li>Inicie a configuração do app:<br />
              <code className="text-cyan-300 block my-1 pl-4">npx cap init "DesembaracarCordas" "com.jogo.cordas" --web-dir=dist</code>
            </li>
            <li>Adicione a plataforma Android:<br />
              <code className="text-cyan-300 block my-1 pl-4">npm i @capacitor/android && npx cap add android</code>
            </li>
            <li>Gere os arquivos de build estáticos:<br />
              <code className="text-cyan-300 block my-1 pl-4">npm run build</code>
            </li>
            <li>Sincronize com o projeto do Android Studio:<br />
              <code className="text-cyan-300 block my-1 pl-4">npx cap sync</code>
            </li>
            <li>Abra o Android Studio para compilar o APK assinado:<br />
              <code className="text-cyan-300 block my-1 pl-4">npx cap open android</code>
            </li>
          </ol>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-[10px] leading-relaxed border border-cyan-500/20 font-sans">
            <strong>Dica Offline:</strong> O APK resultante conterá todos os arquivos necessários internamente. Não necessita de internet para jogar, garantindo 60 FPS nos dispositivos mais simples!
          </div>
        </div>
      </div>

      {/* Danger Zone Full Reset */}
      <div className="pt-4 mt-auto">
        <button
          id="btn-settings-full-reset"
          onClick={handleFullReset}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold font-display text-xs bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Zerar Progresso e Reiniciar Tudo
        </button>
      </div>
    </div>
  );
}
