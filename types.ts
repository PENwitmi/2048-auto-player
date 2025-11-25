export type TileValue = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | number;

export interface TileData {
  id: string; // Unique ID for React keys and animation tracking
  value: TileValue;
  x: number;
  y: number;
  mergedFrom?: { id: string }[]; // Track merges for animation
  isNew?: boolean;
}

export type Grid = (TileData | null)[][];

export enum Direction {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3,
}

export interface GameState {
  grid: Grid;
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}
