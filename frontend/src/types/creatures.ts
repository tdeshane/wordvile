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
  rarity: CreatureRarity;
  description: string;
  dialogue?: string[];
  dropItems?: string[];
  experienceReward: number;
  isNamedHero?: boolean;
  maskCollection?: string[]; // For The Great Lexicon
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
  | 'punctuation_poltergeist' | 'novel_nightmare' | 'meaning_leech' | 'redaction_cultist'
  | 'money_hater' | 'clanger' | 'glitch'
  // Wordvile Legendary
  | 'great_lexicon' | 'synonym_dragon' | 'grammar_guardian' | 'silver' | 'el_qwera' | 'cromatic'
  // Named Heroes
  | 'princutia' | 'mindy_starchild' | 'elda' | 'zara_goldheart' | 'alexia' | 'rosey'
  | 'dena' | 'patuneluea' | 'lifesaber' | 'heartcutter'
  // Mythical Beings
  | 'palindrome_phoenix' | 'alliteration_angel' | 'metaphor_titan'
  // Educational
  | 'alpha' | 'omega' | 'vowel_empress' | 'consonant_king' | 'addition_angel' | 'subtraction_sprite'
  | 'multiplication_mage' | 'division_demon' | 'fraction_fairy' | 'geometry_guardian'
  // Elemental
  | 'blaze' | 'wave' | 'breeze' | 'buzz' | 'thunder_tongue' | 'frost_phrase'
  // Villains and Dark Forces
  | 'unknown' | 'void' | 'wither' | 'shadow' | 'nightmare_narrator' | 'mind_poisoner'
  | 'corruption_king' | 'silence_sovereign' | 'collective'
  // Cosmic and Dimensional
  | 'star_scribe' | 'nebula_narrator' | 'portal_poet' | 'dimension_dreamer'
  // Magical Practitioners
  | 'spell_scriber' | 'enchantment_elephant' | 'crystal_conjurer' | 'archmage_alphabet'
  // Time-based
  | 'timey' | 'past_participle' | 'future_perfect' | 'present_progressive'
  // Abstract Concepts
  | 'infinity_idea' | 'zero_zone' | 'chaos_calculator' | 'order_oracle'
  // Special/Unique
  | 'book_reader' | 'mega_mask' | 'question_mark' | 'greater_than'
  // Common helpers
  | 'spelling_sprite';

export type CreatureCategory = 
  | 'undead' | 'humanoid' | 'beast' | 'dragon' | 'fey' | 'elemental' 
  | 'fiend' | 'celestial' | 'construct' | 'aberration' | 'linguistic'
  | 'educational' | 'cosmic' | 'temporal' | 'abstract' | 'magical'
  | 'heroic' | 'villainous' | 'dimensional';

export type CreatureRarity = 
  | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical' 
  | 'divine' | 'extreme' | 'universe' | 'multiversal' | 'all_realm_power'
  | 'beyond_all_classifications' | 'incomprehensible';

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
