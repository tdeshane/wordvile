// Game items and collectibles types

export interface GameItem {
  id: string;
  type: ItemType;
  position: { x: number; y: number };
  value: number;
  size: { width: number; height: number };
  collected: boolean;
  glitched?: boolean;
  spawnTime: number;
}

export type ItemType = 
  | 'coin'
  | 'gold_bar'
  | 'diamond'
  | 'respawn_token'
  | 'health_potion'
  | 'power_crystal'
  | 'word_scroll';

export interface ItemDefinition {
  type: ItemType;
  displayName: string;
  value: number;
  size: { width: number; height: number };
  color: string;
  glowColor?: string;
  symbol: string;
  canBeGlitched: boolean;
  canBeConsumed: boolean;
}

export const ITEM_DEFINITIONS: Record<ItemType, ItemDefinition> = {
  coin: {
    type: 'coin',
    displayName: 'Gold Coin',
    value: 10,
    size: { width: 30, height: 30 },
    color: '#ffd700',
    glowColor: '#ffed4b',
    symbol: '$',
    canBeGlitched: true,
    canBeConsumed: true
  },
  gold_bar: {
    type: 'gold_bar',
    displayName: 'Gold Bar',
    value: 50,
    size: { width: 40, height: 25 },
    color: '#ffd700',
    glowColor: '#ffed4b',
    symbol: '▬',
    canBeGlitched: true,
    canBeConsumed: true
  },
  diamond: {
    type: 'diamond',
    displayName: 'Diamond',
    value: 100,
    size: { width: 35, height: 35 },
    color: '#b9f2ff',
    glowColor: '#e0f7ff',
    symbol: '◆',
    canBeGlitched: true,
    canBeConsumed: true
  },
  respawn_token: {
    type: 'respawn_token',
    displayName: 'Respawn Token',
    value: 200,
    size: { width: 35, height: 35 },
    color: '#90ee90',
    glowColor: '#98fb98',
    symbol: '↻',
    canBeGlitched: true,
    canBeConsumed: true
  },
  health_potion: {
    type: 'health_potion',
    displayName: 'Health Potion',
    value: 25,
    size: { width: 25, height: 35 },
    color: '#ff6b6b',
    glowColor: '#ff8787',
    symbol: '⚗',
    canBeGlitched: true,
    canBeConsumed: false
  },
  power_crystal: {
    type: 'power_crystal',
    displayName: 'Power Crystal',
    value: 75,
    size: { width: 30, height: 40 },
    color: '#9370db',
    glowColor: '#b19cd9',
    symbol: '⬟',
    canBeGlitched: true,
    canBeConsumed: false
  },
  word_scroll: {
    type: 'word_scroll',
    displayName: 'Word Scroll',
    value: 30,
    size: { width: 35, height: 30 },
    color: '#daa520',
    glowColor: '#f4e04d',
    symbol: '📜',
    canBeGlitched: true,
    canBeConsumed: false
  }
};