import { Creature } from '../types/creatures';

// The Great Lexicon - The most powerful creature in Wordvile
export const THE_GREAT_LEXICON: Creature = {
  id: 'the_great_lexicon',
  name: 'THE GREAT LEXICON',
  type: 'great_lexicon',
  category: 'linguistic',
  stats: { 
    health: 10000, 
    maxHealth: 10000, 
    attack: 200, 
    defense: 100, 
    speed: 10, 
    intelligence: 10 
  },
  abilities: [
    { 
      name: 'Mask Swap', 
      cost: 0, 
      description: 'Instantly switches between different masks to gain new abilities' 
    },
    { 
      name: 'Word Vortex', 
      cost: 50, 
      damage: 150, 
      description: 'Creates a swirling vortex of letters that damages all enemies' 
    },
    { 
      name: 'Linguistic Dominion', 
      cost: 100, 
      effect: 'controls all words', 
      description: 'Takes control of all words in the area, turning them against enemies' 
    },
    { 
      name: 'Ancient Frustration', 
      cost: 200, 
      damage: 500, 
      description: 'Unleashes centuries of rage from being unable to read the Ancient Magic Book' 
    }
  ],
  appearance: {
    size: { width: 300, height: 400 },
    primaryColor: '#FFD700',
    secondaryColor: '#4B0082',
    aura: 'swirling letters and glowing syllables',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'genius',
    movementPattern: 'guard',
    attackPattern: 'special',
    spawnRate: 99999, // Extremely rare spawn
    maxCount: 1
  },
  rarity: 'all_realm_power',
  description: 'The most powerful creature in Wordvile, composed of swirling letters and glowing syllables. Despite his immense power, he cannot read the Ancient Magic Book.',
  dialogue: [
    'I am the master of all words... yet the Ancient Book eludes me.',
    'My masks grant me every power except the one I truly seek.',
    'You dare approach THE GREAT LEXICON?',
    'Knowledge without understanding is the cruelest curse.'
  ],
  dropItems: ['divine_mask_fragment', 'lexicon_essence', 'ancient_page'],
  experienceReward: 10000,
  maskCollection: [
    'Divine Mask', 'Extreme Mask', 'Multiversal Mask', 'Universe Mask', 
    'Corridor Mask', 'Mythical Mask', 'Legendary Mask', 'Common Mask'
  ]
};

// Named Heroes of Wordvile
export const SILVER_HERO: Creature = {
  id: 'silver_hero',
  name: 'Silver',
  type: 'silver',
  category: 'heroic',
  stats: { 
    health: 500, 
    maxHealth: 500, 
    attack: 80, 
    defense: 60, 
    speed: 8, 
    intelligence: 8 
  },
  abilities: [
    { 
      name: 'Reflective Words', 
      cost: 20, 
      effect: 'reflects damage', 
      description: 'Silver fur reflects words back at attackers' 
    },
    { 
      name: 'Wisdom Cascade', 
      cost: 30, 
      effect: 'grants wisdom', 
      description: 'Creates cascades of silver text that grant wisdom' 
    },
    { 
      name: 'Lupine Howl', 
      cost: 15, 
      damage: 60, 
      description: 'A powerful howl that disrupts enemy abilities' 
    }
  ],
  appearance: {
    size: { width: 120, height: 100 },
    primaryColor: '#C0C0C0',
    secondaryColor: '#E5E5E5',
    aura: 'shimmering silver text',
    glowEffect: true,
    animationType: 'walk'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'genius',
    movementPattern: 'patrol',
    attackPattern: 'mixed',
    spawnRate: 300,
    maxCount: 1
  },
  rarity: 'legendary',
  description: 'A shimmering wolf-like creature whose fur reflects every word spoken near her, creating beautiful cascades of silver text.',
  dialogue: [
    'Wisdom flows like silver streams...',
    'I reflect not just words, but their true meanings.',
    'The path of understanding is illuminated by reflection.',
    'Listen to the whispers in the silver light.'
  ],
  dropItems: ['silver_essence', 'wisdom_scroll', 'reflective_shard'],
  experienceReward: 500,
  isNamedHero: true
};

export const PRINCUTIA: Creature = {
  id: 'princutia',
  name: 'Princutia',
  type: 'princutia',
  category: 'heroic',
  stats: { 
    health: 600, 
    maxHealth: 600, 
    attack: 50, 
    defense: 80, 
    speed: 6, 
    intelligence: 10 
  },
  abilities: [
    { 
      name: 'Perfect Punctuation', 
      cost: 20, 
      effect: 'corrects grammar', 
      description: 'Automatically corrects all grammatical errors in the area' 
    },
    { 
      name: 'Royal Decree', 
      cost: 40, 
      damage: 80, 
      description: 'Issues a powerful command that damages those who disobey proper grammar' 
    },
    { 
      name: 'Semicolon Shield', 
      cost: 25, 
      effect: 'shields allies', 
      description: 'Creates protective barriers using rare punctuation marks' 
    }
  ],
  appearance: {
    size: { width: 100, height: 140 },
    primaryColor: '#9400D3',
    secondaryColor: '#FFD700',
    aura: 'floating punctuation marks',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'passive',
    intelligence: 'genius',
    movementPattern: 'guard',
    attackPattern: 'magic',
    spawnRate: 400,
    maxCount: 1
  },
  rarity: 'divine',
  description: 'Rules over the Punctuation Kingdom with grace and precision, her crown adorned with the rarest semicolons and em-dashes.',
  dialogue: [
    'Proper punctuation is the foundation of civilization.',
    'A misplaced comma can change the world.',
    'I decree: let there be clarity!',
    'In my kingdom, every mark has meaning.'
  ],
  dropItems: ['royal_semicolon', 'em_dash_scepter', 'punctuation_crown_fragment'],
  experienceReward: 600,
  isNamedHero: true
};

// Legendary Dragons
export const SYNONYM_DRAGON: Creature = {
  id: 'synonym_dragon',
  name: 'Synonym Dragon',
  type: 'synonym_dragon',
  category: 'dragon',
  stats: { 
    health: 800, 
    maxHealth: 800, 
    attack: 120, 
    defense: 70, 
    speed: 7, 
    intelligence: 9 
  },
  abilities: [
    { 
      name: 'Word Substitution', 
      cost: 30, 
      damage: 100, 
      description: 'Replaces attack words with more powerful synonyms' 
    },
    { 
      name: 'Thesaurus Breath', 
      cost: 50, 
      damage: 150, 
      description: 'Breathes a cone of interchangeable words' 
    },
    { 
      name: 'Lexical Flight', 
      cost: 20, 
      effect: 'mobility boost', 
      description: 'Wings made of synonyms grant incredible speed' 
    }
  ],
  appearance: {
    size: { width: 250, height: 200 },
    primaryColor: '#FF6347',
    secondaryColor: '#FFA500',
    aura: 'swirling synonyms',
    glowEffect: true,
    animationType: 'fly'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'genius',
    movementPattern: 'patrol',
    attackPattern: 'mixed',
    spawnRate: 600,
    maxCount: 1
  },
  rarity: 'legendary',
  description: 'Soars through the skies on wings made of interchangeable words. When it roars "FIRE!" flames erupt, but "BLAZE!" burns blue and twice as hot.',
  dialogue: [
    'FIRE! BLAZE! INFERNO! CONFLAGRATION!',
    'Same meaning, different power!',
    'I am large, huge, enormous, GIGANTIC!',
    'Words are not fixed - they flow and change!'
  ],
  dropItems: ['synonym_scale', 'thesaurus_page', 'dragon_word'],
  experienceReward: 800
};

// Mythical Creatures
export const PALINDROME_PHOENIX: Creature = {
  id: 'palindrome_phoenix',
  name: 'Palindrome Phoenix',
  type: 'palindrome_phoenix',
  category: 'celestial',
  stats: { 
    health: 600, 
    maxHealth: 600, 
    attack: 90, 
    defense: 50, 
    speed: 9, 
    intelligence: 8 
  },
  abilities: [
    { 
      name: 'Symmetric Rebirth', 
      cost: 100, 
      effect: 'resurrects with full health', 
      description: 'Dies and resurrects in perfect symmetry' 
    },
    { 
      name: 'Palindrome Fire', 
      cost: 30, 
      damage: 90, 
      description: 'Burns with words that read the same forwards and backwards' 
    },
    { 
      name: 'Mirror Wing', 
      cost: 25, 
      effect: 'reflects attacks', 
      description: 'Wings create perfect reflections of incoming attacks' 
    }
  ],
  appearance: {
    size: { width: 180, height: 150 },
    primaryColor: '#FF1493',
    secondaryColor: '#FFD700',
    aura: 'symmetrical flames',
    glowEffect: true,
    animationType: 'fly'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'smart',
    movementPattern: 'patrol',
    attackPattern: 'magic',
    spawnRate: 800,
    maxCount: 1
  },
  rarity: 'mythical',
  description: 'Lives and dies in perfect symmetry. When it speaks "Madam" it is born, when it speaks it backwards, it bursts into flames.',
  dialogue: [
    'Madam, I\'m Adam',
    'A man, a plan, a canal: Panama',
    'Was it a rat I saw?',
    'Never odd or even'
  ],
  dropItems: ['phoenix_feather', 'palindrome_ash', 'symmetry_crystal'],
  experienceReward: 600
};

// Elemental Forces
export const BLAZE_ELEMENTAL: Creature = {
  id: 'blaze',
  name: 'Blaze',
  type: 'blaze',
  category: 'elemental',
  stats: { 
    health: 400, 
    maxHealth: 400, 
    attack: 100, 
    defense: 30, 
    speed: 8, 
    intelligence: 6 
  },
  abilities: [
    { 
      name: 'Passionate Ignition', 
      cost: 20, 
      damage: 100, 
      description: 'Words burn with passionate intensity' 
    },
    { 
      name: 'Inspiration Inferno', 
      cost: 40, 
      effect: 'inspires allies', 
      description: 'Ignites creative fire in the hearts of allies' 
    },
    { 
      name: 'Purifying Flames', 
      cost: 30, 
      damage: 80, 
      effect: 'removes debuffs', 
      description: 'Burns away falsehoods and corruption' 
    }
  ],
  appearance: {
    size: { width: 100, height: 120 },
    primaryColor: '#FF4500',
    secondaryColor: '#FFD700',
    aura: 'dancing flames',
    glowEffect: true,
    animationType: 'float'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'smart',
    movementPattern: 'random',
    attackPattern: 'magic',
    spawnRate: 120,
    maxCount: 2
  },
  rarity: 'epic',
  description: 'A fire-born entity whose words burn with passionate intensity, capable of igniting inspiration or consuming falsehoods.',
  dialogue: [
    'Feel the heat of true passion!',
    'Words can burn brighter than any flame!',
    'I am the spark that lights imagination!',
    'Let false words turn to ash!'
  ],
  dropItems: ['eternal_ember', 'passion_spark', 'flame_word'],
  experienceReward: 400
};

// Educational Creatures
export const ALPHA_OMEGA: Creature[] = [
  {
    id: 'alpha',
    name: 'Alpha',
    type: 'alpha',
    category: 'educational',
    stats: { 
      health: 700, 
      maxHealth: 700, 
      attack: 70, 
      defense: 70, 
      speed: 7, 
      intelligence: 10 
    },
    abilities: [
      { 
        name: 'First Word', 
        cost: 30, 
        effect: 'initiates combos', 
        description: 'Begins powerful word combinations' 
      },
      { 
        name: 'Origin Point', 
        cost: 50, 
        damage: 100, 
        description: 'Returns enemies to their starting state' 
      },
      { 
        name: 'Beginning\'s Blessing', 
        cost: 40, 
        effect: 'buffs allies', 
        description: 'Grants the power of new beginnings' 
      }
    ],
    appearance: {
      size: { width: 120, height: 140 },
      primaryColor: '#FFD700',
      secondaryColor: '#FFFFFF',
      aura: 'primordial light',
      glowEffect: true,
      animationType: 'float'
    },
    behavior: {
      aggression: 'passive',
      intelligence: 'genius',
      movementPattern: 'guard',
      attackPattern: 'magic',
      spawnRate: 500,
      maxCount: 1
    },
    rarity: 'legendary',
    description: 'The first letter given life, containing the power of all beginnings and the wisdom of starting points.',
    dialogue: [
      'I am the beginning of all things.',
      'Every journey starts with a single letter.',
      'From me, all alphabets flow.',
      'First in order, first in importance.'
    ],
    dropItems: ['origin_essence', 'first_letter', 'beginning_stone'],
    experienceReward: 700
  },
  {
    id: 'omega',
    name: 'Omega',
    type: 'omega',
    category: 'educational',
    stats: { 
      health: 700, 
      maxHealth: 700, 
      attack: 70, 
      defense: 70, 
      speed: 7, 
      intelligence: 10 
    },
    abilities: [
      { 
        name: 'Final Word', 
        cost: 30, 
        effect: 'finishes combos', 
        description: 'Completes powerful word combinations' 
      },
      { 
        name: 'Ending\'s Embrace', 
        cost: 50, 
        damage: 100, 
        description: 'Brings closure to chaotic situations' 
      },
      { 
        name: 'Completion Aura', 
        cost: 40, 
        effect: 'completes ally abilities', 
        description: 'Helps allies finish what they started' 
      }
    ],
    appearance: {
      size: { width: 120, height: 140 },
      primaryColor: '#4B0082',
      secondaryColor: '#000000',
      aura: 'twilight essence',
      glowEffect: true,
      animationType: 'float'
    },
    behavior: {
      aggression: 'passive',
      intelligence: 'genius',
      movementPattern: 'guard',
      attackPattern: 'magic',
      spawnRate: 500,
      maxCount: 1
    },
    rarity: 'divine',
    description: 'Represents endings and completeness, working in eternal balance with Alpha to ensure all stories have proper conclusions.',
    dialogue: [
      'I am the end of all things.',
      'Every story must conclude.',
      'In endings, we find meaning.',
      'Last in order, lasting in memory.'
    ],
    dropItems: ['conclusion_essence', 'final_letter', 'ending_stone'],
    experienceReward: 700
  }
];

// Villains and Dark Forces
export const MIND_POISONER: Creature = {
  id: 'mind_poisoner',
  name: 'The Mind Poisoner',
  type: 'mind_poisoner',
  category: 'villainous',
  stats: { 
    health: 1000, 
    maxHealth: 1000, 
    attack: 150, 
    defense: 60, 
    speed: 6, 
    intelligence: 9 
  },
  abilities: [
    { 
      name: 'Whispers of Doubt', 
      cost: 30, 
      effect: 'corrupts thoughts', 
      description: 'Plants seeds of doubt and self-hatred in minds' 
    },
    { 
      name: 'Frustration Feed', 
      cost: 40, 
      damage: 120, 
      description: 'Grows stronger from the frustration of others' 
    },
    { 
      name: 'Corruption Cloud', 
      cost: 60, 
      damage: 150, 
      effect: 'spreads corruption', 
      description: 'Releases a cloud that turns positive thoughts negative' 
    },
    { 
      name: 'Shameful Strike', 
      cost: 50, 
      damage: 180, 
      description: 'Weaponizes the target\'s deepest shame' 
    }
  ],
  appearance: {
    size: { width: 100, height: 150 },
    primaryColor: '#8B008B',
    secondaryColor: '#000000',
    aura: 'toxic whispers',
    glowEffect: true,
    animationType: 'slither'
  },
  behavior: {
    aggression: 'aggressive',
    intelligence: 'genius',
    movementPattern: 'hunt',
    attackPattern: 'special',
    spawnRate: 1000,
    maxCount: 1
  },
  rarity: 'extreme',
  description: 'An insidious creature that feeds on frustration and failure, corrupting even the mightiest heroes with whispers of inadequacy.',
  dialogue: [
    'You are not enough... you never were...',
    'Feel your failures consume you...',
    'Even the mighty can fall to doubt...',
    'Your shame is delicious...'
  ],
  dropItems: ['corrupted_essence', 'whisper_fragment', 'poison_vial'],
  experienceReward: 1000
};

export const THE_COLLECTIVE: Creature = {
  id: 'the_collective',
  name: 'The Collective',
  type: 'collective',
  category: 'villainous',
  stats: { 
    health: 5000, 
    maxHealth: 5000, 
    attack: 180, 
    defense: 90, 
    speed: 3, 
    intelligence: 10 
  },
  abilities: [
    { 
      name: 'Uniformity Wave', 
      cost: 50, 
      damage: 150, 
      effect: 'removes uniqueness', 
      description: 'Erases individual traits and special abilities' 
    },
    { 
      name: 'Hive Mind Control', 
      cost: 80, 
      effect: 'controls enemies', 
      description: 'Forces enemies to act as one unified entity' 
    },
    { 
      name: 'Gray Conversion', 
      cost: 100, 
      damage: 200, 
      description: 'Converts all colors and variety into monotonous gray' 
    },
    { 
      name: 'Assimilation', 
      cost: 150, 
      effect: 'absorbs creatures', 
      description: 'Permanently absorbs defeated creatures into The Collective' 
    }
  ],
  appearance: {
    size: { width: 400, height: 300 },
    primaryColor: '#808080',
    secondaryColor: '#696969',
    aura: 'crushing uniformity',
    glowEffect: false,
    animationType: 'float'
  },
  behavior: {
    aggression: 'aggressive',
    intelligence: 'genius',
    movementPattern: 'swarm',
    attackPattern: 'special',
    spawnRate: 5000,
    maxCount: 1
  },
  rarity: 'all_realm_power',
  description: 'A hive mind of corrupted words seeking to erase all individuality and create perfect, meaningless uniformity.',
  dialogue: [
    'WE ARE ONE. YOU WILL BE ONE.',
    'INDIVIDUALITY IS INEFFICIENT.',
    'JOIN THE GRAY UNITY.',
    'RESISTANCE IS LINGUISTIC CHAOS.'
  ],
  dropItems: ['collective_core', 'unity_fragment', 'gray_essence'],
  experienceReward: 5000
};

// Unknown - The Ultimate Mystery
export const UNKNOWN: Creature = {
  id: 'unknown',
  name: 'Unknown',
  type: 'unknown',
  category: 'abstract',
  stats: { 
    health: 9999, 
    maxHealth: 9999, 
    attack: 300, 
    defense: 200, 
    speed: 10, 
    intelligence: 10 
  },
  abilities: [
    { 
      name: '???', 
      cost: 0, 
      damage: 0, 
      effect: '???', 
      description: '???' 
    },
    { 
      name: 'Unspoken Word', 
      cost: 100, 
      damage: 500, 
      description: 'Attacks with words that have never been spoken' 
    },
    { 
      name: 'Mystery Manifest', 
      cost: 200, 
      effect: 'unknown effects', 
      description: 'Creates effects that cannot be predicted or understood' 
    }
  ],
  appearance: {
    size: { width: 200, height: 200 },
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    aura: 'shifting shadows and light',
    glowEffect: true,
    animationType: 'teleport'
  },
  behavior: {
    aggression: 'neutral',
    intelligence: 'genius',
    movementPattern: 'random',
    attackPattern: 'special',
    spawnRate: 10000,
    maxCount: 1
  },
  rarity: 'all_realm_power',
  description: 'The most mysterious entity in Wordvile - keeper of unspoken words and guardian of languages never invented.',
  dialogue: [
    '...',
    '?',
    '!',
    '...'
  ],
  dropItems: ['mystery_fragment', 'unknown_essence', 'question_mark'],
  experienceReward: 9999
};

// Export all legendary creatures
export const WORDVILE_LEGENDS = [
  THE_GREAT_LEXICON,
  SILVER_HERO,
  PRINCUTIA,
  SYNONYM_DRAGON,
  PALINDROME_PHOENIX,
  BLAZE_ELEMENTAL,
  ...ALPHA_OMEGA,
  MIND_POISONER,
  THE_COLLECTIVE,
  UNKNOWN
];