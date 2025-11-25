import React from 'react';
import { Grid } from '../types';
import Tile from './Tile';
import { GRID_SIZE } from '../constants';

interface BoardProps {
  grid: Grid;
}

const Board: React.FC<BoardProps> = ({ grid }) => {
  // Flatten tiles for rendering
  const tiles = grid.flat().filter(t => t !== null);

  // Create background grid cells (16 cells)
  const gridCells = Array.from({ length: GRID_SIZE * GRID_SIZE });

  return (
    <div className="relative w-full max-w-2xl aspect-square bg-[#bbada0] rounded-xl p-2 mx-auto touch-none shadow-2xl">
      {/* Background Grid - Uses flex to create the grid structure naturally */}
      <div className="flex flex-wrap w-full h-full">
        {gridCells.map((_, i) => (
          <div key={i} className="w-1/4 h-1/4 p-2">
            <div className="w-full h-full bg-[#cdc1b4] rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Floating Tiles Container */}
      {/* absolute inset-0 covers the whole board including the outer padding.
          We add p-2 here so the internal content box matches the flex container above. */}
      <div className="absolute inset-0 p-2 pointer-events-none">
         <div className="relative w-full h-full">
            {tiles.map((tile) => (
              tile && <Tile key={tile.id} tile={tile} />
            ))}
         </div>
      </div>
    </div>
  );
};

export default Board;