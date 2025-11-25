import { Grid, TileData, Direction, GameState, TileValue } from '../types';
import { GRID_SIZE } from '../constants';

// Helper to create an empty grid
export const getEmptyGrid = (): Grid => {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
};

// Helper to check if grid is full
const checkGridFull = (grid: Grid): boolean => {
  return grid.every((row) => row.every((cell) => cell !== null));
};

// Helper to generate a random tile
export const addRandomTile = (grid: Grid): Grid => {
  if (checkGridFull(grid)) return grid;

  const emptyCells: { x: number; y: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) {
        emptyCells.push({ x: c, y: r });
      }
    }
  }

  if (emptyCells.length === 0) return grid;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newTile: TileData = {
    id: Math.random().toString(36).substr(2, 9),
    value,
    x: randomCell.x,
    y: randomCell.y,
    isNew: true,
  };

  const newGrid = grid.map((row) => [...row]);
  newGrid[randomCell.y][randomCell.x] = newTile;
  return newGrid;
};

// Initialize game
export const initGame = (): GameState => {
  let grid = getEmptyGrid();
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  return {
    grid,
    score: 0,
    bestScore: parseInt(localStorage.getItem('2048-best-score') || '0', 10),
    gameOver: false,
    won: false,
  };
};

// Rotate grid to simplify move logic (always move left, then rotate back)
const rotateLeft = (grid: Grid): Grid => {
  const newGrid = getEmptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      newGrid[GRID_SIZE - 1 - c][r] = grid[r][c];
    }
  }
  return newGrid;
};

const rotateRight = (grid: Grid): Grid => {
  const newGrid = getEmptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      newGrid[c][GRID_SIZE - 1 - r] = grid[r][c];
    }
  }
  return newGrid;
};

// Core move logic (moves left)
const moveLeft = (grid: Grid): { grid: Grid; score: number; moved: boolean } => {
  const newGrid = getEmptyGrid();
  let score = 0;
  let moved = false;

  for (let r = 0; r < GRID_SIZE; r++) {
    const row = grid[r].filter((t) => t !== null) as TileData[];
    const newRow: (TileData | null)[] = [];
    let skip = false;

    for (let c = 0; c < row.length; c++) {
      if (skip) {
        skip = false;
        continue;
      }

      const current = row[c];
      const next = row[c + 1];

      if (next && current.value === next.value) {
        // Merge
        const newValue = (current.value * 2) as TileValue;
        const mergedTile: TileData = {
          id: Math.random().toString(36).substr(2, 9), // New ID for merged tile
          value: newValue,
          x: newRow.length,
          y: r,
          mergedFrom: [current, next], // Track parents if needed for animation
          isNew: false
        };
        newRow.push(mergedTile);
        score += newValue;
        skip = true;
        moved = true; // Merging counts as a move
      } else {
        // Just move
        const movedTile: TileData = {
          ...current,
          x: newRow.length,
          y: r,
          mergedFrom: undefined,
          isNew: false
        };
        newRow.push(movedTile);
      }
    }

    // Check if positions changed to determine 'moved'
    if (newRow.length !== row.length) moved = true;
    else {
      for(let i=0; i<newRow.length; i++) {
        if(newRow[i]?.value !== grid[r][i]?.value) moved = true;
      }
    }

    // Fill rest with null
    while (newRow.length < GRID_SIZE) {
      newRow.push(null);
    }

    // Assign back to grid
    newGrid[r] = newRow;
  }

  // Double check if any tile actually changed position (coordinate check)
  // This is a bit simplified, strict check compares input grid to output grid
  const gridsDifferent = JSON.stringify(grid) !== JSON.stringify(newGrid);
  
  return { grid: newGrid, score, moved: gridsDifferent };
};

export const move = (grid: Grid, direction: Direction): { grid: Grid; score: number; moved: boolean } => {
  let tempGrid = grid;
  let rotations = 0;

  if (direction === Direction.Up) {
    tempGrid = rotateLeft(tempGrid);
    rotations = 1;
  } else if (direction === Direction.Right) {
    tempGrid = rotateLeft(rotateLeft(tempGrid));
    rotations = 2;
  } else if (direction === Direction.Down) {
    tempGrid = rotateRight(tempGrid);
    rotations = 3;
  }

  const result = moveLeft(tempGrid);

  // Rotate back
  let finalGrid = result.grid;
  if (rotations === 1) finalGrid = rotateRight(finalGrid);
  if (rotations === 2) finalGrid = rotateRight(rotateRight(finalGrid));
  if (rotations === 3) finalGrid = rotateLeft(finalGrid);
  
  // Correct coordinates in tiles after rotation back
  finalGrid = finalGrid.map((row, r) => row.map((tile, c) => {
     if(tile) return {...tile, x: c, y: r};
     return null;
  }));

  return { grid: finalGrid, score: result.score, moved: result.moved };
};

export const checkGameOver = (grid: Grid): boolean => {
  // Check empty cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) return false;
    }
  }

  // Check merges
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const current = grid[r][c]?.value;
      if (c < GRID_SIZE - 1 && current === grid[r][c + 1]?.value) return false;
      if (r < GRID_SIZE - 1 && current === grid[r + 1][c]?.value) return false;
    }
  }
  return true;
};
