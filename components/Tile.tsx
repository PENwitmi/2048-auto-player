import React from 'react';
import { TileData } from '../types';
import { TILE_COLORS, DEFAULT_TILE_COLOR } from '../constants';

interface TileProps {
  tile: TileData;
}

const Tile: React.FC<TileProps> = ({ tile }) => {
  const colorClass = TILE_COLORS[tile.value] || DEFAULT_TILE_COLOR;
  
  // New positioning logic:
  // Use pure percentages for the wrapper position and size.
  // Use padding to create the visual gap.
  // This matches the "flex" layout of the background grid in Board.tsx.
  const style: React.CSSProperties = {
    left: `${tile.x * 25}%`,
    top: `${tile.y * 25}%`,
    width: '25%',
    height: '25%',
    position: 'absolute',
    transition: 'all 100ms ease-in-out',
    zIndex: tile.isNew ? 10 : 1,
  };

  // Increased padding to p-2 to match the Board's gap
  return (
    <div style={style} className="p-2">
      <div 
        className={`w-full h-full rounded-lg font-bold flex items-center justify-center select-none shadow-sm ${colorClass} ${tile.isNew ? 'tile-new' : ''} ${tile.mergedFrom ? 'tile-merged' : ''}`}
      >
        {tile.value}
      </div>
    </div>
  );
};

export default Tile;