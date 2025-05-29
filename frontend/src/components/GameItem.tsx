import React from 'react';
import { GameItem as GameItemType, ITEM_DEFINITIONS } from '../types/gameItems';

interface GameItemProps {
  item: GameItemType;
  onClick?: () => void;
}

export const GameItem: React.FC<GameItemProps> = ({ item, onClick }) => {
  const definition = ITEM_DEFINITIONS[item.type];
  
  const getGlitchClass = () => {
    if (!item.glitched) return '';
    return 'item-glitched';
  };
  
  const itemStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${item.position.x}px`,
    top: `${item.position.y}px`,
    width: `${definition.size.width}px`,
    height: `${definition.size.height}px`,
    backgroundColor: definition.color,
    border: `2px solid ${definition.color}`,
    borderRadius: item.type === 'coin' || item.type === 'respawn_token' ? '50%' : '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: onClick ? 'pointer' : 'default',
    boxShadow: definition.glowColor ? `0 0 10px ${definition.glowColor}` : 'none',
    transition: 'all 0.3s ease',
    zIndex: 5,
    userSelect: 'none',
    opacity: item.collected ? 0 : 1,
    transform: item.collected ? 'scale(1.5)' : 'scale(1)',
    color: item.type === 'diamond' ? '#4169e1' : '#333'
  };
  
  return (
    <div 
      className={`game-item item-${item.type} ${getGlitchClass()}`}
      style={itemStyle}
      onClick={onClick}
      title={`${definition.displayName} (${definition.value} points)`}
      data-item-id={item.id}
    >
      {definition.symbol}
    </div>
  );
};