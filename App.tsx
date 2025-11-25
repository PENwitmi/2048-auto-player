import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Direction } from './types';
import { initGame, move, addRandomTile, checkGameOver } from './services/gameLogic';
import { getBestMove } from './services/aiService';
import { getGeminiAdvice } from './services/geminiService';
import Board from './components/Board';
import GameControls from './components/GameControls';
import { AI_DELAY_MS } from './constants';
import { X, Trophy, Frown, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initGame);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [aiSpeed, setAiSpeed] = useState<number>(AI_DELAY_MS);
  const [geminiAdvice, setGeminiAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Persist best score
  useEffect(() => {
    if (gameState.score > gameState.bestScore) {
      setGameState(prev => {
        const newBest = prev.score;
        localStorage.setItem('2048-best-score', newBest.toString());
        return { ...prev, bestScore: newBest };
      });
    }
  }, [gameState.score]);

  const handleMove = useCallback((direction: Direction) => {
    setGameState((prev) => {
      if (prev.gameOver) return prev;

      const result = move(prev.grid, direction);
      if (!result.moved) return prev;

      const newGrid = addRandomTile(result.grid);
      const isGameOver = checkGameOver(newGrid);

      return {
        ...prev,
        grid: newGrid,
        score: prev.score + result.score,
        gameOver: isGameOver,
      };
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (autoPlaying) return; // Disable manual input during auto-play
      
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); handleMove(Direction.Up); break;
        case 'ArrowDown': e.preventDefault(); handleMove(Direction.Down); break;
        case 'ArrowLeft': e.preventDefault(); handleMove(Direction.Left); break;
        case 'ArrowRight': e.preventDefault(); handleMove(Direction.Right); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, autoPlaying]);

  // Auto-play Loop
  useEffect(() => {
    if (autoPlaying && !gameState.gameOver) {
      autoPlayTimerRef.current = setTimeout(() => {
        const bestDirection = getBestMove(gameState.grid);
        handleMove(bestDirection);
      }, aiSpeed);
    } else if (gameState.gameOver) {
      setAutoPlaying(false);
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [autoPlaying, gameState.grid, gameState.gameOver, handleMove, aiSpeed]);

  const toggleAutoPlay = () => {
    setAutoPlaying(!autoPlaying);
  };

  const startNewGame = () => {
    setGameState(initGame());
    setAutoPlaying(false);
    setGeminiAdvice(null);
  };

  const askGemini = async () => {
    if (gameState.gameOver) return;
    setIsAdviceLoading(true);
    setGeminiAdvice(null);
    const advice = await getGeminiAdvice(gameState.grid);
    setGeminiAdvice(advice);
    setIsAdviceLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#faf8ef] flex flex-col items-center py-6 px-4">
      
      <GameControls 
        onNewGame={startNewGame}
        onAutoPlay={toggleAutoPlay}
        onAskGemini={askGemini}
        autoPlaying={autoPlaying}
        score={gameState.score}
        bestScore={gameState.bestScore}
        loadingGemini={isAdviceLoading}
        aiSpeed={aiSpeed}
        onSpeedChange={setAiSpeed}
      />

      <div className="relative w-full flex justify-center">
        <Board grid={gameState.grid} />
        
        {/* Game Over Overlay */}
        {gameState.gameOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center shadow-2xl animate-fade-in border-4 border-[#8f7a66]">
              <h2 className="text-5xl font-bold text-[#776e65] mb-6">Game Over!</h2>
              <div className="flex flex-col items-center gap-3 mb-8">
                 {gameState.score >= gameState.bestScore && gameState.score > 0 ? (
                   <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
                      <Trophy size={32} /> New Best Score!
                   </div>
                 ) : (
                   <p className="text-xl text-gray-600 font-bold flex items-center gap-2"><Frown size={32} /> Try again!</p>
                 )}
                 <p className="text-2xl font-bold text-[#776e65]">Score: {gameState.score}</p>
              </div>
              <button 
                onClick={startNewGame}
                className="px-8 py-4 bg-[#8f7a66] hover:bg-[#806c59] text-white rounded-lg font-bold text-xl shadow-lg transition-transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gemini Advice Panel */}
      {(geminiAdvice || isAdviceLoading) && (
        <div className="mt-8 w-full max-w-2xl bg-white rounded-xl shadow-lg border border-purple-100 p-6 transition-all duration-300">
           <div className="flex items-center gap-2 mb-4 text-purple-700 font-bold text-xl">
              <Sparkles size={24} />
              <h3>Gemini Coach Strategy</h3>
              <button onClick={() => setGeminiAdvice(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                 <X size={24} />
              </button>
           </div>
           
           {isAdviceLoading ? (
             <div className="flex flex-col items-center py-6 space-y-3">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-base text-gray-500 animate-pulse">Analyzing board structure...</p>
             </div>
           ) : (
             <div className="prose prose-purple prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {geminiAdvice}
             </div>
           )}
        </div>
      )}

      <div className="mt-8 text-center text-[#776e65] text-sm opacity-75">
        <p className="mb-2">Use <strong>Arrow keys</strong> to move tiles.</p>
        <p><strong>Auto Play</strong> uses a local Expectimax AI algorithm.</p>
        <p><strong>Coach</strong> uses Google Gemini Flash 2.5 to analyze the board.</p>
      </div>
    </div>
  );
};

export default App;