import React from 'react';
import { RefreshCw, Play, Pause, Bot, BrainCircuit, Zap } from 'lucide-react';
import { AI_DELAY_MS } from '../constants';

interface GameControlsProps {
  onNewGame: () => void;
  onAutoPlay: () => void;
  onAskGemini: () => void;
  autoPlaying: boolean;
  score: number;
  bestScore: number;
  loadingGemini: boolean;
  aiSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onNewGame, 
  onAutoPlay, 
  onAskGemini, 
  autoPlaying, 
  score, 
  bestScore,
  loadingGemini,
  aiSpeed,
  onSpeedChange
}) => {
  
  const speeds = [
    { label: '1x', value: AI_DELAY_MS },
    { label: '2x', value: AI_DELAY_MS / 2 },
    { label: '4x', value: AI_DELAY_MS / 4 },
    { label: '8x', value: AI_DELAY_MS / 8 },
    { label: '16x', value: AI_DELAY_MS / 16 },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 px-2">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-5xl md:text-7xl font-bold text-[#776e65]">2048</h1>
           <p className="text-[#776e65] text-lg font-semibold">Join the numbers!</p>
        </div>
        <div className="flex gap-3 text-white text-center">
            <div className="bg-[#bbada0] rounded-lg px-4 py-3 min-w-[100px]">
                <div className="text-xs md:text-sm font-bold text-[#eee4da] uppercase tracking-wider">Score</div>
                <div className="font-bold text-2xl md:text-3xl">{score}</div>
            </div>
            <div className="bg-[#bbada0] rounded-lg px-4 py-3 min-w-[100px]">
                <div className="text-xs md:text-sm font-bold text-[#eee4da] uppercase tracking-wider">Best</div>
                <div className="font-bold text-2xl md:text-3xl">{bestScore}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-between items-center">
        <button 
          onClick={onNewGame}
          className="flex items-center gap-2 px-6 py-4 bg-[#8f7a66] hover:bg-[#806c59] text-white rounded-lg font-bold text-lg transition-colors shadow-md active:scale-95"
        >
          <RefreshCw size={24} /> New Game
        </button>

        <div className="flex flex-wrap gap-3 items-center">
            {/* Speed Control */}
            <div className="flex bg-[#bbada0] rounded-lg p-1 mr-1 shadow-inner h-[60px] items-center overflow-x-auto no-scrollbar max-w-[280px] md:max-w-none">
                <div className="px-2 text-[#eee4da] hidden md:block flex-shrink-0">
                  <Zap size={20} />
                </div>
                {speeds.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => onSpeedChange(s.value)}
                    className={`
                      px-2 md:px-3 py-2 rounded-md text-sm font-bold transition-all mx-0.5 flex-shrink-0 whitespace-nowrap
                      ${aiSpeed === s.value 
                        ? 'bg-[#edc22e] text-white shadow-sm scale-105' 
                        : 'text-[#f9f6f2] hover:bg-[#a69688]'}
                    `}
                  >
                    {s.label}
                  </button>
                ))}
            </div>

            <button 
                onClick={onAutoPlay}
                className={`flex items-center gap-2 px-6 py-4 rounded-lg font-bold text-lg transition-colors text-white shadow-md active:scale-95 h-[60px] ${autoPlaying ? 'bg-orange-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
                {autoPlaying ? <Pause size={24} /> : <Play size={24} />}
                {autoPlaying ? 'Stop' : 'Auto'}
            </button>
            <button 
                onClick={onAskGemini}
                disabled={loadingGemini || autoPlaying}
                className={`flex items-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg transition-colors shadow-md active:scale-95 h-[60px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {loadingGemini ? <BrainCircuit size={24} className="animate-spin" /> : <Bot size={24} />}
                Coach
            </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;