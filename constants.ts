import { TileValue } from './types';

export const GRID_SIZE = 4;

// Using responsive text sizes: 
// Base (mobile) -> md (tablet) -> lg (desktop with large board)
export const TILE_COLORS: Record<number, string> = {
  2: 'bg-[#eee4da] text-[#776e65] text-4xl md:text-6xl lg:text-7xl',
  4: 'bg-[#ede0c8] text-[#776e65] text-4xl md:text-6xl lg:text-7xl',
  8: 'bg-[#f2b179] text-white text-4xl md:text-6xl lg:text-7xl',
  16: 'bg-[#f59563] text-white text-3xl md:text-5xl lg:text-6xl',
  32: 'bg-[#f67c5f] text-white text-3xl md:text-5xl lg:text-6xl',
  64: 'bg-[#f65e3b] text-white text-3xl md:text-5xl lg:text-6xl',
  128: 'bg-[#edcf72] text-white text-2xl md:text-4xl lg:text-5xl',
  256: 'bg-[#edcc61] text-white text-2xl md:text-4xl lg:text-5xl',
  512: 'bg-[#edc850] text-white text-2xl md:text-4xl lg:text-5xl',
  1024: 'bg-[#edc53f] text-white text-xl md:text-3xl lg:text-4xl',
  2048: 'bg-[#edc22e] text-white text-xl md:text-3xl lg:text-4xl shadow-[0_0_30px_10px_rgba(243,215,116,0.4)]',
};

export const DEFAULT_TILE_COLOR = 'bg-[#3c3a32] text-white text-xl md:text-3xl';

export const AI_DELAY_MS = 100; // Speed of auto-play