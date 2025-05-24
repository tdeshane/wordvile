// Creature system types and definitions for Wordvile

export interface CreatureStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
}

export interface CreatureAbility {
  name: string;
  cost: number;
  damage?: number;
  effect?: string;
  cooldown?: number;
  description: string;
}

export interface CreatureAppearance {
  size: { width: number; height: number };
  primaryColor: string;
  secondaryColor?: string;
  aura?: string;
  glowEffect?: boolean;
  animationType: 'float' | 'walk' | 'fly' | 'slither' | 'teleport';
}

export interface Creature {
  id: string;
  name: string;
  type: CreatureType;
  category: CreatureCategory;
  stats: CreatureStats;
  abilities: CreatureAbility[];
  appearance: CreatureAppearance;
  behavior: CreatureBehavior;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  dialogue?: string[];
  dropItems?: string[];
  experienceReward: number;
}

export type CreatureType = 
  // Undead
  | 'zombie' | 'skeleton' | 'ghost' | 'wraith' | 'lich' | 'mummy' | 'banshee'
  // Humanoid
  | 'villager' | 'guard' | 'merchant' | 'scholar' | 'priest' | 'warrior' | 'archer'
  // Fantasy Creatures
  | 'dragon' | 'goblin' | 'orc' | 'troll' | 'ogre' | 'giant' | 'elemental'
  // Magical Beings
  | 'fairy' | 'pixie' | 'unicorn' | 'phoenix' | 'griffin' | 'pegasus' | 'sphinx'
  // Monsters
  | 'slime' | 'spider' | 'wolf' | 'bear' | 'minotaur' | 'hydra' | 'kraken'
  // Wordvile Specific
  | 'word_zombie' | 'grammar_goblin' | 'dictionary_dragon' | 'alphabet_skeleton'
  | 'punctuation_poltergeist' | 'novel_nightmare' | 'meaning_leech' | 'redaction_cultist';

export type CreatureCategory = 
  | 'undead' | 'humanoid' | 'beast' | 'dragon' | 'fey' | 'elemental' 
  | 'fiend' | 'celestial' | 'construct' | 'aberration' | 'linguistic';

export interface CreatureBehavior {
  aggression: 'passive' | 'neutral' | 'hostile' | 'aggressive';
  intelligence: 'mindless' | 'basic' | 'smart' | 'genius';
  movementPattern: 'random' | 'patrol' | 'guard' | 'hunt' | 'swarm';
  attackPattern: 'melee' | 'ranged' | 'magic' | 'special' | 'mixed';
  spawnRate: number; // seconds between spawns
  maxCount: number; // maximum on screen at once
}

export interface CreatureSpawn {
  creature: Creature;
  position: { x: number; y: number };
  health: number;
  state: 'spawning' | 'idle' | 'moving' | 'attacking' | 'dying' | 'dead';
  target?: number; // word index being targeted
  lastAttack: number;
  spawnTime: number;
}
