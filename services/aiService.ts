import { Grid, Direction } from '../types';

// A lightweight simplified grid representation for the AI to process faster (number[][])
type SimpleGrid = number[][];

const gridToSimple = (grid: Grid): SimpleGrid => {
  return grid.map(row => row.map(cell => cell ? (cell.value as number) : 0));
};

// Re-implement move logic for simple grid (faster for recursion)
const moveSimple = (grid: SimpleGrid, direction: Direction): { grid: SimpleGrid; moved: boolean; score: number } => {
  // Rotate to Left
  let temp = grid.map(row => [...row]);
  const rotateLeft = (g: SimpleGrid) => {
    const newG = Array(4).fill(0).map(() => Array(4).fill(0));
    for(let r=0; r<4; r++) for(let c=0; c<4; c++) newG[3-c][r] = g[r][c];
    return newG;
  };
  
  let rots = 0;
  if (direction === Direction.Up) { temp = rotateLeft(temp); rots = 1; }
  else if (direction === Direction.Right) { temp = rotateLeft(rotateLeft(temp)); rots = 2; }
  else if (direction === Direction.Down) { temp = rotateLeft(rotateLeft(rotateLeft(temp))); rots = 3; }

  // Move Left Logic
  let score = 0;
  let moved = false;
  for (let r = 0; r < 4; r++) {
    let row = temp[r].filter(v => v !== 0);
    for (let c = 0; c < row.length - 1; c++) {
      if (row[c] === row[c+1]) {
        row[c] *= 2;
        score += row[c];
        row.splice(c+1, 1);
      }
    }
    while(row.length < 4) row.push(0);
    if (row.join(',') !== temp[r].join(',')) moved = true;
    temp[r] = row;
  }

  // Rotate Back
  const rotateRight = (g: SimpleGrid) => {
    const newG = Array(4).fill(0).map(() => Array(4).fill(0));
    for(let r=0; r<4; r++) for(let c=0; c<4; c++) newG[c][3-r] = g[r][c];
    return newG;
  };
  
  if (rots === 1) temp = rotateRight(temp);
  else if (rots === 2) temp = rotateRight(rotateRight(temp));
  else if (rots === 3) temp = rotateLeft(temp); // 3 lefts back is 1 left

  return { grid: temp, moved, score };
};

// --- STRATEGY IMPLEMENTATION ---

// "Snake" Gradient Matrix
// This weighting pushes the largest numbers towards the bottom-right corner 
// and encourages a snake-like chain: 
// 12 <- 13 <- 14 <- 15 (Highest)
// |
// 11 -> 10 -> 9  -> 8
//                   |
// 4  <- 5  <- 6  <- 7
// |
// 3  -> 2  -> 1  -> 0
const SNAKE_WEIGHTS = [
  [Math.pow(4, 0), Math.pow(4, 1), Math.pow(4, 2), Math.pow(4, 3)],
  [Math.pow(4, 7), Math.pow(4, 6), Math.pow(4, 5), Math.pow(4, 4)],
  [Math.pow(4, 8), Math.pow(4, 9), Math.pow(4, 10), Math.pow(4, 11)],
  [Math.pow(4, 15), Math.pow(4, 14), Math.pow(4, 13), Math.pow(4, 12)],
];

// Helper to calculate dot product of grid and weights
const calculateScore = (grid: SimpleGrid, weights: number[][]): number => {
  let score = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] !== 0) {
        score += grid[r][c] * weights[r][c];
      }
    }
  }
  return score;
};

// Rotate grid 90 degrees clockwise
const rotateGrid = (grid: SimpleGrid): SimpleGrid => {
  const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newGrid[c][3 - r] = grid[r][c];
    }
  }
  return newGrid;
};

// Mirror grid horizontally
const mirrorGrid = (grid: SimpleGrid): SimpleGrid => {
  return grid.map(row => [...row].reverse());
};

const evaluateGrid = (grid: SimpleGrid): number => {
  // Strategy: 
  // We want to force the snake pattern, but we don't know which corner the user (or chance) 
  // has built the big tile into. 
  // So we rotate/mirror the current board to test it against our fixed SNAKE_WEIGHTS 
  // in all 8 possible symmetries (4 rotations * 2 mirrors).
  // The MAX score represents how well the board fits *any* valid snake configuration.

  let maxScore = 0;
  let current = grid;

  // Try all 4 rotations
  for (let i = 0; i < 4; i++) {
    maxScore = Math.max(maxScore, calculateScore(current, SNAKE_WEIGHTS));
    current = rotateGrid(current);
  }

  // Try mirror image (and its 4 rotations)
  let mirrored = mirrorGrid(grid);
  for (let i = 0; i < 4; i++) {
    maxScore = Math.max(maxScore, calculateScore(mirrored, SNAKE_WEIGHTS));
    mirrored = rotateGrid(mirrored);
  }

  return maxScore;
};

// Expectimax Algorithm
const expectimax = (grid: SimpleGrid, depth: number, isPlayer: boolean): number => {
  if (depth === 0) return evaluateGrid(grid);

  if (isPlayer) {
    let bestScore = -Infinity;
    // Try all 4 directions
    for (const dir of [Direction.Up, Direction.Right, Direction.Down, Direction.Left]) {
      const res = moveSimple(grid, dir);
      if (res.moved) {
        const score = expectimax(res.grid, depth - 1, false);
        if (score > bestScore) bestScore = score;
      }
    }
    // If no moves are possible, return a very low score
    return bestScore === -Infinity ? -1e20 : bestScore;
  } else {
    // Chance node (Random tile spawn)
    let totalScore = 0;
    let emptySpots = [];
    
    for(let r=0; r<4; r++) for(let c=0; c<4; c++) if(grid[r][c] === 0) emptySpots.push({r, c});
    
    if (emptySpots.length === 0) return evaluateGrid(grid);

    // Optimization: When searching deep, we can't test every single empty cell if there are too many.
    // Standard optimization: 
    // If emptySpots > 4 and depth > 2, limit the chance node to only checking a subset or simplified average
    // to prevent exponential explosion. However, for standard 2048, < 6 empty spots allows full search.
    
    for (const spot of emptySpots) {
       // Test 2 (90% chance)
       grid[spot.r][spot.c] = 2;
       totalScore += 0.9 * expectimax(grid, depth - 1, true);
       
       // Test 4 (10% chance)
       grid[spot.r][spot.c] = 4;
       totalScore += 0.1 * expectimax(grid, depth - 1, true);
       
       // Reset
       grid[spot.r][spot.c] = 0;
    }
    
    return totalScore / emptySpots.length;
  }
};

export const getBestMove = (grid: Grid): Direction => {
  const simpleGrid = gridToSimple(grid);
  
  // Analyze current board state to determine depth
  let maxTile = 0;
  let emptyCount = 0;
  
  for (const row of simpleGrid) {
    for (const val of row) {
      if (val > maxTile) maxTile = val;
      if (val === 0) emptyCount++;
    }
  }

  // Dynamic Depth Logic:
  // Default depth is 3 (good balance of speed vs IQ).
  // If we have achieved 2048, we need more precision, so increase to 4.
  // If the board is very crowded (<= 4 empty slots), the branching factor for 'Chance' nodes is low,
  // allowing us to search even deeper (Depth 5) without performance penalty, which is critical for survival.
  let depth = 3;
  if (maxTile >= 2048) {
    depth = 4;
    if (emptyCount <= 4) {
      depth = 5;
    }
  }
  
  let bestDir: Direction = Direction.Up; // Default
  let maxScore = -Infinity;

  const moves = [Direction.Up, Direction.Right, Direction.Down, Direction.Left];
  
  // Randomize order slightly to break perfect ties
  moves.sort(() => Math.random() - 0.5);

  for (const dir of moves) {
    const res = moveSimple(simpleGrid, dir);
    if (res.moved) {
      const score = expectimax(res.grid, depth, false); 
      if (score > maxScore) {
        maxScore = score;
        bestDir = dir;
      }
    }
  }

  return bestDir;
};
