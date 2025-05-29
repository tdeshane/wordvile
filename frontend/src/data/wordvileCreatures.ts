import { Creature } from '../types/creatures';

// Named Heroes and Characters
export const MINDY_STARCHILD: Creature = {
  id: 'mindy_starchild',
  name: 'Mindy Starchild',
  type: 'mindy_starchild',
  category: 'cosmic',
  stats: { 
    health: 550, 
    maxHealth: 550, 
    attack: 85, 
    defense: 55, 
    speed: 8, 
    intelligence: 9 
  },
  abilities: [
    { 
      name: 'Constellation Words', 
      cost: 30, 
      damage: 80, 
      description: 'Writes prophecies in the stars that rain down as attacks' 
    },
    { 
      name: 'Stellar Poetry', 
      cost: 40, 
      effect: 'reveals future', 
      description: 'Star patterns reveal future events' 
    },
    { 
      name: 'Cosmic Verse', 
      cost: 50, 
      damage: 120, 
      description: 'Channels the power of celestial poetry' 
    }
  ],
  appearance: {
    size: { width: 110, height: 130 },
    primaryColor: '#191970',
    secondaryColor: '#FFD700',
    aura: 'constellation patterns',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'passive',
    intelligence: 'genius',
    movementPattern: 'patrol',
    attackPattern: 'magic',
    spawnRate: 450,
    maxCount: 1
  },
  rarity: 'mythical',
  description: 'Born from the intersection of astronomy and poetry, her body composed of constellation words that spell different prophecies.',
  dialogue: [
    'The stars speak in verses tonight...',
    'Your future is written in the cosmos.',
    'Poetry and starlight are one.',
    'Read the sky, know your destiny.'
  ],
  dropItems: ['star_ink', 'prophecy_scroll', 'cosmic_verse'],
  experienceReward: 550,
  isNamedHero: true
};

export const ELDA: Creature = {
  id: 'elda',
  name: 'Elda',
  type: 'elda',
  category: 'fey',
  stats: { 
    health: 450, 
    maxHealth: 450, 
    attack: 60, 
    defense: 70, 
    speed: 5, 
    intelligence: 10 
  },
  abilities: [
    { 
      name: 'Ancient Story', 
      cost: 25, 
      effect: 'teaches wisdom', 
      description: 'Shares ancient tales that grant knowledge' 
    },
    { 
      name: 'Bark Scripture', 
      cost: 35, 
      damage: 70, 
      description: 'Words carved in bark come alive to attack' 
    },
    { 
      name: 'Living Library', 
      cost: 45, 
      effect: 'summons knowledge', 
      description: 'Accesses any story ever told' 
    }
  ],
  appearance: {
    size: { width: 140, height: 180 },
    primaryColor: '#8B4513',
    secondaryColor: '#228B22',
    aura: 'falling leaves with words',
    glowEffect: false,
    animationType: 'walk'
  },
  behavior: {
    aggression: 'passive',
    intelligence: 'genius',
    movementPattern: 'guard',
    attackPattern: 'magic',
    spawnRate: 400,
    maxCount: 1
  },
  rarity: 'epic',
  description: 'An ancient tree-spirit whose bark is inscribed with the oldest stories in Wordvile, serving as the living library.',
  dialogue: [
    'Every ring tells a story...',
    'I have stood here since words began.',
    'The old tales live within me.',
    'Listen to the whisper of ancient pages.'
  ],
  dropItems: ['ancient_bark', 'story_seed', 'memory_leaf'],
  experienceReward: 450,
  isNamedHero: true
};

export const ZARA_GOLDHEART: Creature = {
  id: 'zara_goldheart',
  name: 'Zara Goldheart',
  type: 'zara_goldheart',
  category: 'celestial',
  stats: { 
    health: 700, 
    maxHealth: 700, 
    attack: 70, 
    defense: 85, 
    speed: 6, 
    intelligence: 9 
  },
  abilities: [
    { 
      name: 'Golden Word Healing', 
      cost: 30, 
      effect: 'heals allies', 
      description: 'Golden words mend wounds and restore hope' 
    },
    { 
      name: 'Compassionate Touch', 
      cost: 20, 
      effect: 'removes debuffs', 
      description: 'Pure kindness removes all negative effects' 
    },
    { 
      name: 'Heart of Gold', 
      cost: 60, 
      damage: 100, 
      effect: 'heals and damages', 
      description: 'Heals allies while damaging those with evil intent' 
    }
  ],
  appearance: {
    size: { width: 100, height: 120 },
    primaryColor: '#FFD700',
    secondaryColor: '#FFA500',
    aura: 'golden warmth',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'passive',
    intelligence: 'genius',
    movementPattern: 'patrol',
    attackPattern: 'magic',
    spawnRate: 500,
    maxCount: 1
  },
  rarity: 'divine',
  description: 'Possesses a heart made of pure golden words that can heal any linguistic wound or mend broken narratives.',
  dialogue: [
    'Let golden words heal your pain.',
    'Compassion is the strongest magic.',
    'Every heart deserves gentle words.',
    'I mend what harsh words have broken.'
  ],
  dropItems: ['golden_word', 'heart_essence', 'compassion_crystal'],
  experienceReward: 700,
  isNamedHero: true
};

// Elemental Creatures
export const WAVE_ELEMENTAL: Creature = {
  id: 'wave',
  name: 'Wave',
  type: 'wave',
  category: 'elemental',
  stats: { 
    health: 350, 
    maxHealth: 350, 
    attack: 75, 
    defense: 45, 
    speed: 8, 
    intelligence: 7 
  },
  abilities: [
    { 
      name: 'Tidal Words', 
      cost: 25, 
      damage: 75, 
      description: 'Words crash like ocean waves' 
    },
    { 
      name: 'Linguistic Flow', 
      cost: 30, 
      effect: 'speed boost', 
      description: 'Flows like liquid language, increasing movement' 
    },
    { 
      name: 'Tsunami of Eloquence', 
      cost: 50, 
      damage: 110, 
      description: 'Overwhelming wave of perfect speech' 
    }
  ],
  appearance: {
    size: { width: 110, height: 90 },
    primaryColor: '#4682B4',
    secondaryColor: '#87CEEB',
    aura: 'flowing water',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'smart',
    movementPattern: 'patrol',
    attackPattern: 'magic',
    spawnRate: 100,
    maxCount: 2
  },
  rarity: 'rare',
  description: 'Flows like liquid language, adapting to any conversational container while maintaining essential nature.',
  dialogue: [
    'Words flow like water...',
    'I adapt to any vessel.',
    'The tide of language is eternal.',
    'Fluid speech, solid meaning.'
  ],
  dropItems: ['water_word', 'flow_essence', 'tide_token'],
  experienceReward: 350
};

// Educational Math Creatures
export const ADDITION_ANGEL: Creature = {
  id: 'addition_angel',
  name: 'Addition Angel',
  type: 'addition_angel',
  category: 'educational',
  stats: { 
    health: 200, 
    maxHealth: 200, 
    attack: 40, 
    defense: 30, 
    speed: 7, 
    intelligence: 8 
  },
  abilities: [
    { 
      name: 'Sum of Parts', 
      cost: 15, 
      effect: 'combines attacks', 
      description: 'Adds ally attacks together for combo damage' 
    },
    { 
      name: 'Positive Addition', 
      cost: 20, 
      effect: 'buffs allies', 
      description: 'Adds strength to all allies' 
    },
    { 
      name: 'Mathematical Truth', 
      cost: 25, 
      damage: 60, 
      description: 'Attacks with the certainty that 2+2=4' 
    }
  ],
  appearance: {
    size: { width: 80, height: 100 },
    primaryColor: '#00FF00',
    secondaryColor: '#FFFFFF',
    aura: 'plus signs',
    glowEffect: true,
    animationType: 'fly'
  },
  behavior: {
    aggression: 'passive',
    intelligence: 'smart',
    movementPattern: 'patrol',
    attackPattern: 'magic',
    spawnRate: 60,
    maxCount: 3
  },
  rarity: 'rare',
  description: 'Helps struggling students understand that 2+2=4 and that mathematical language is beautiful.',
  dialogue: [
    'Let\'s add it all together!',
    'Two plus two equals four!',
    'Addition makes things greater!',
    'Together we are more!'
  ],
  dropItems: ['plus_symbol', 'sum_stone', 'addition_scroll'],
  experienceReward: 200
};

export const MULTIPLICATION_MAGE: Creature = {
  id: 'multiplication_mage',
  name: 'Multiplication Mage',
  type: 'multiplication_mage',
  category: 'educational',
  stats: { 
    health: 400, 
    maxHealth: 400, 
    attack: 80, 
    defense: 50, 
    speed: 6, 
    intelligence: 9 
  },
  abilities: [
    { 
      name: 'Exponential Growth', 
      cost: 30, 
      damage: 80, 
      effect: 'multiplies damage', 
      description: 'Each hit multiplies the damage of the next' 
    },
    { 
      name: 'Times Table Terror', 
      cost: 40, 
      damage: 120, 
      description: 'Attacks with the power of multiplication tables' 
    },
    { 
      name: 'Factor Finding', 
      cost: 25, 
      effect: 'reveals weaknesses', 
      description: 'Finds the factors that make enemies vulnerable' 
    }
  ],
  appearance: {
    size: { width: 100, height: 120 },
    primaryColor: '#9932CC',
    secondaryColor: '#FFD700',
    aura: 'multiplication symbols',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'genius',
    movementPattern: 'guard',
    attackPattern: 'magic',
    spawnRate: 150,
    maxCount: 1
  },
  rarity: 'epic',
  description: 'Possesses the power to amplify words and meanings exponentially, turning simple statements into complex truths.',
  dialogue: [
    'Three times three equals nine!',
    'Watch your power multiply!',
    'Exponential growth is magical!',
    'Factor in all possibilities!'
  ],
  dropItems: ['multiplication_sign', 'factor_crystal', 'times_table'],
  experienceReward: 400
};

// Dark Forces and Villains
export const SHADOW_CREATURE: Creature = {
  id: 'shadow',
  name: 'Shadow',
  type: 'shadow',
  category: 'villainous',
  stats: { 
    health: 600, 
    maxHealth: 600, 
    attack: 110, 
    defense: 70, 
    speed: 9, 
    intelligence: 8 
  },
  abilities: [
    { 
      name: 'Darkness Falls', 
      cost: 30, 
      effect: 'blinds enemies', 
      description: 'Obscures all meaning in darkness' 
    },
    { 
      name: 'Shadow Strike', 
      cost: 25, 
      damage: 110, 
      description: 'Attacks from the shadows of words' 
    },
    { 
      name: 'Eclipse of Understanding', 
      cost: 60, 
      damage: 150, 
      effect: 'removes clarity', 
      description: 'Blocks all light of comprehension' 
    }
  ],
  appearance: {
    size: { width: 100, height: 140 },
    primaryColor: '#000000',
    secondaryColor: '#1C1C1C',
    aura: 'consuming darkness',
    glowEffect: false,
    animationType: 'teleport'
  },
  behavior: {
    aggression: 'aggressive',
    intelligence: 'smart',
    movementPattern: 'hunt',
    attackPattern: 'special',
    spawnRate: 200,
    maxCount: 2
  },
  rarity: 'legendary',
  description: 'The antithesis of light and clarity, creeping through Wordvile to obscure meanings and hide truths.',
  dialogue: [
    'In darkness, all words are equal...',
    'Light reveals too much...',
    'Embrace the shadows of uncertainty...',
    'Truth hides in darkness...'
  ],
  dropItems: ['shadow_essence', 'darkness_fragment', 'void_shard'],
  experienceReward: 600
};

export const NIGHTMARE_NARRATOR: Creature = {
  id: 'nightmare_narrator',
  name: 'Nightmare Narrator',
  type: 'nightmare_narrator',
  category: 'villainous',
  stats: { 
    health: 800, 
    maxHealth: 800, 
    attack: 140, 
    defense: 60, 
    speed: 7, 
    intelligence: 9 
  },
  abilities: [
    { 
      name: 'Terror Tale', 
      cost: 40, 
      damage: 120, 
      effect: 'causes fear', 
      description: 'Tells stories so terrifying they manifest as reality' 
    },
    { 
      name: 'Living Nightmare', 
      cost: 60, 
      effect: 'summons fears', 
      description: 'Makes worst fears come to life' 
    },
    { 
      name: 'Endless Horror', 
      cost: 80, 
      damage: 180, 
      description: 'Traps victims in never-ending scary stories' 
    }
  ],
  appearance: {
    size: { width: 120, height: 150 },
    primaryColor: '#8B0000',
    secondaryColor: '#000000',
    aura: 'writhing nightmares',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'aggressive',
    intelligence: 'genius',
    movementPattern: 'hunt',
    attackPattern: 'special',
    spawnRate: 800,
    maxCount: 1
  },
  rarity: 'extreme',
  description: 'Tells stories so terrifying that they manifest as living nightmares, stalking through dreams.',
  dialogue: [
    'Let me tell you a scary story...',
    'Your nightmares are my favorite tales...',
    'Sweet dreams... forever...',
    'The horror never ends...'
  ],
  dropItems: ['nightmare_ink', 'terror_page', 'fear_essence'],
  experienceReward: 800
};

// Cosmic and Dimensional Beings
export const STAR_SCRIBE: Creature = {
  id: 'star_scribe',
  name: 'Star Scribe',
  type: 'star_scribe',
  category: 'cosmic',
  stats: { 
    health: 1200, 
    maxHealth: 1200, 
    attack: 160, 
    defense: 100, 
    speed: 10, 
    intelligence: 10 
  },
  abilities: [
    { 
      name: 'Constellation Writing', 
      cost: 50, 
      damage: 140, 
      description: 'Writes epic tales using stars as letters' 
    },
    { 
      name: 'Celestial Grammar', 
      cost: 70, 
      effect: 'rewrites reality', 
      description: 'Uses cosmic grammar to alter fundamental laws' 
    },
    { 
      name: 'Universal Story', 
      cost: 100, 
      damage: 200, 
      description: 'Tells a story that encompasses entire galaxies' 
    }
  ],
  appearance: {
    size: { width: 200, height: 250 },
    primaryColor: '#000080',
    secondaryColor: '#FFD700',
    aura: 'stellar formations',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'genius',
    movementPattern: 'patrol',
    attackPattern: 'magic',
    spawnRate: 2000,
    maxCount: 1
  },
  rarity: 'multiversal',
  description: 'Writes stories across the night sky using constellations as letters, creating epic tales readable only by celestial scholars.',
  dialogue: [
    'Each star is a letter in my cosmic tale...',
    'The universe is my manuscript...',
    'Read the sky, understand infinity...',
    'Galaxies form my punctuation...'
  ],
  dropItems: ['star_ink', 'cosmic_quill', 'constellation_map'],
  experienceReward: 1200
};

// Special and Unique Beings
export const BOOK_READER: Creature = {
  id: 'book_reader',
  name: 'The Book Reader',
  type: 'book_reader',
  category: 'heroic',
  stats: { 
    health: 8000, 
    maxHealth: 8000, 
    attack: 250, 
    defense: 150, 
    speed: 10, 
    intelligence: 10 
  },
  abilities: [
    { 
      name: 'True Comprehension', 
      cost: 0, 
      effect: 'understands all', 
      description: 'Can read and understand any text, including the Ancient Magic Book' 
    },
    { 
      name: 'Page Turn of Fate', 
      cost: 100, 
      damage: 300, 
      description: 'Each page turned rewrites destiny' 
    },
    { 
      name: 'Story Mastery', 
      cost: 150, 
      effect: 'controls narrative', 
      description: 'Takes control of the story itself' 
    },
    { 
      name: 'Ancient Knowledge', 
      cost: 200, 
      damage: 500, 
      description: 'Unleashes the wisdom of every book ever written' 
    }
  ],
  appearance: {
    size: { width: 150, height: 200 },
    primaryColor: '#4B0082',
    secondaryColor: '#FFD700',
    aura: 'floating pages and glowing text',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'genius',
    movementPattern: 'guard',
    attackPattern: 'special',
    spawnRate: 9999,
    maxCount: 1
  },
  rarity: 'all_realm_power',
  description: 'The only being who can decipher the Ancient Magic Book. Cloaked in robes woven from every story ever told.',
  dialogue: [
    'Understanding comes not from power, but from connection...',
    'The Ancient Book speaks to those who truly listen...',
    'Every story has meaning for those who seek it...',
    'I read not just words, but the spaces between them...'
  ],
  dropItems: ['page_of_understanding', 'reader_essence', 'ancient_bookmark'],
  experienceReward: 8000,
  isNamedHero: true
};

// Time-based Creatures
export const TIMEY: Creature = {
  id: 'timey',
  name: 'Timey',
  type: 'timey',
  category: 'temporal',
  stats: { 
    health: 250, 
    maxHealth: 250, 
    attack: 55, 
    defense: 40, 
    speed: 8, 
    intelligence: 7 
  },
  abilities: [
    { 
      name: 'Yesterday\'s News', 
      cost: 20, 
      damage: 50, 
      description: 'Attacks with outdated information' 
    },
    { 
      name: 'Tomorrow\'s Promise', 
      cost: 25, 
      effect: 'delays damage', 
      description: 'Damage arrives in the future' 
    },
    { 
      name: 'Meanwhile...', 
      cost: 30, 
      effect: 'time skip', 
      description: 'Skips to a different moment in time' 
    }
  ],
  appearance: {
    size: { width: 80, height: 100 },
    primaryColor: '#FFD700',
    secondaryColor: '#C0C0C0',
    aura: 'clock gears',
    glowEffect: true,
    animationType: 'teleport'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'smart',
    movementPattern: 'random',
    attackPattern: 'special',
    spawnRate: 80,
    maxCount: 2
  },
  rarity: 'uncommon',
  description: 'A peculiar creature obsessed with temporal words, never quite existing in the present moment.',
  dialogue: [
    'Yesterday I was here tomorrow!',
    'Meanwhile, in the past future...',
    'Time is just another word!',
    'See you yesterday!'
  ],
  dropItems: ['time_fragment', 'temporal_dust', 'clock_word'],
  experienceReward: 250,
  isNamedHero: true
};

// Common Creatures
export const SPELLING_SPRITE: Creature = {
  id: 'spelling_sprite',
  name: 'Spelling Sprite',
  type: 'spelling_sprite',
  category: 'fey',
  stats: { 
    health: 50, 
    maxHealth: 50, 
    attack: 20, 
    defense: 10, 
    speed: 9, 
    intelligence: 6 
  },
  abilities: [
    { 
      name: 'Typo Fix', 
      cost: 10, 
      effect: 'heals allies', 
      description: 'Corrects mistakes and heals wounds' 
    },
    { 
      name: 'Letter Swap', 
      cost: 15, 
      damage: 25, 
      description: 'Rearranges enemy letters to cause confusion' 
    }
  ],
  appearance: {
    size: { width: 40, height: 50 },
    primaryColor: '#FF69B4',
    secondaryColor: '#FFB6C1',
    aura: 'sparkles',
    glowEffect: true,
    animationType: 'fly'
  },
  behavior: {
    aggression: 'passive',
    intelligence: 'smart',
    movementPattern: 'random',
    attackPattern: 'magic',
    spawnRate: 30,
    maxCount: 5
  },
  rarity: 'common',
  description: 'Tiny creatures that flutter about, correcting typos with their magic wands.',
  dialogue: [
    'That\'s not how you spell it!',
    'Let me fix that for you!',
    'Spelling matters!',
    'Typos begone!'
  ],
  dropItems: ['spell_dust', 'tiny_wand', 'correction_fluid'],
  experienceReward: 50
};

// Export creature collections
export const WORDVILE_HEROES = [
  MINDY_STARCHILD,
  ELDA,
  ZARA_GOLDHEART,
  BOOK_READER,
  TIMEY
];

export const WORDVILE_VILLAINS = [
  SHADOW_CREATURE,
  NIGHTMARE_NARRATOR
];

export const WORDVILE_ELEMENTALS = [
  WAVE_ELEMENTAL
];

export const WORDVILE_EDUCATIONAL = [
  ADDITION_ANGEL,
  MULTIPLICATION_MAGE
];

export const WORDVILE_COSMIC = [
  STAR_SCRIBE
];

export const WORDVILE_COMMON = [
  SPELLING_SPRITE
];

export const ALL_WORDVILE_CREATURES = [
  ...WORDVILE_HEROES,
  ...WORDVILE_VILLAINS,
  ...WORDVILE_ELEMENTALS,
  ...WORDVILE_EDUCATIONAL,
  ...WORDVILE_COSMIC,
  ...WORDVILE_COMMON
];