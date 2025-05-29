import { Creature } from '../types/creatures';
import { WORDVILE_LEGENDS } from './wordvileLegends';
import { ALL_WORDVILE_CREATURES } from './wordvileCreatures';

// Undead Creatures
export const ZOMBIE_VARIANTS: Creature[] = [
  {
    id: 'word_zombie',
    name: 'Word Zombie',
    type: 'word_zombie',
    category: 'undead',
    stats: { health: 30, maxHealth: 30, attack: 8, defense: 2, speed: 3, intelligence: 1 },
    abilities: [
      { name: 'Vocabulary Drain', cost: 0, damage: 5, description: 'Drains words from player vocabulary' },
      { name: 'Shamble Attack', cost: 0, damage: 8, description: 'Basic melee attack' }
    ],
    appearance: {
      size: { width: 80, height: 120 },
      primaryColor: '#4a4a4a',
      secondaryColor: '#2a2a2a',
      aura: 'gray mist',
      glowEffect: false,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'mindless',
      movementPattern: 'hunt',
      attackPattern: 'melee',
      spawnRate: 15,
      maxCount: 3
    },
    rarity: 'common',
    description: 'Shambling undead that drain vocabulary from their victims',
    dialogue: ['Graaah...', 'Words... need words...', 'Hungry...'],
    dropItems: ['gray essence', 'torn page'],
    experienceReward: 10
  },
  {
    id: 'fast_zombie',
    name: 'Fast Zombie',
    type: 'zombie',
    category: 'undead',
    stats: { health: 25, maxHealth: 25, attack: 12, defense: 1, speed: 7, intelligence: 1 },
    abilities: [
      { name: 'Sprint Attack', cost: 0, damage: 12, description: 'Quick rushing attack' },
      { name: 'Frenzy', cost: 5, damage: 15, effect: 'multiple attacks', description: 'Rapid consecutive attacks' }
    ],
    appearance: {
      size: { width: 75, height: 115 },
      primaryColor: '#6a4a4a',
      secondaryColor: '#3a2a2a',
      aura: 'red mist',
      glowEffect: true,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'aggressive',
      intelligence: 'basic',
      movementPattern: 'hunt',
      attackPattern: 'melee',
      spawnRate: 20,
      maxCount: 2
    },
    rarity: 'uncommon',
    description: 'Faster, more aggressive zombie variant',
    dialogue: ['RAAAAWR!', 'Fast... hungry...', 'BRAINS!'],
    dropItems: ['red essence', 'speed potion'],
    experienceReward: 15
  },
  {
    id: 'armored_zombie',
    name: 'Armored Zombie',
    type: 'zombie',
    category: 'undead',
    stats: { health: 50, maxHealth: 50, attack: 10, defense: 8, speed: 2, intelligence: 1 },
    abilities: [
      { name: 'Shield Bash', cost: 0, damage: 10, description: 'Heavy defensive attack' },
      { name: 'Fortify', cost: 10, effect: 'increased defense', description: 'Temporarily increases defense' }
    ],
    appearance: {
      size: { width: 90, height: 130 },
      primaryColor: '#5a5a5a',
      secondaryColor: '#8a8a8a',
      aura: 'metallic gleam',
      glowEffect: false,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'basic',
      movementPattern: 'patrol',
      attackPattern: 'melee',
      spawnRate: 30,
      maxCount: 1
    },
    rarity: 'rare',
    description: 'Heavily armored zombie with enhanced durability',
    dialogue: ['Clank... clank...', 'Heavy...', 'Protected...'],
    dropItems: ['metal scraps', 'armor piece'],
    experienceReward: 25
  }
];

export const SKELETON_VARIANTS: Creature[] = [
  {
    id: 'alphabet_skeleton',
    name: 'Alphabet Skeleton',
    type: 'alphabet_skeleton',
    category: 'undead',
    stats: { health: 25, maxHealth: 25, attack: 10, defense: 3, speed: 5, intelligence: 3 },
    abilities: [
      { name: 'Letter Shot', cost: 0, damage: 8, description: 'Fires letters as projectiles' },
      { name: 'Spell Word', cost: 15, damage: 20, description: 'Creates harmful words in the air' }
    ],
    appearance: {
      size: { width: 70, height: 110 },
      primaryColor: '#f0f0f0',
      secondaryColor: '#333333',
      aura: 'floating letters',
      glowEffect: true,
      animationType: 'float'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'smart',
      movementPattern: 'patrol',
      attackPattern: 'ranged',
      spawnRate: 18,
      maxCount: 2
    },
    rarity: 'uncommon',
    description: 'Skeletal undead composed of floating letters and punctuation',
    dialogue: ['A-B-C-DEATH!', 'Spelling doom...', 'Letters of destruction!'],
    dropItems: ['bone letter', 'alphabet scroll'],
    experienceReward: 18
  },
  {
    id: 'archer_skeleton',
    name: 'Skeleton Archer',
    type: 'skeleton',
    category: 'undead',
    stats: { health: 20, maxHealth: 20, attack: 15, defense: 2, speed: 4, intelligence: 2 },
    abilities: [
      { name: 'Bone Arrow', cost: 0, damage: 15, description: 'Fires a sharp bone arrow' },
      { name: 'Multi-Shot', cost: 8, damage: 12, effect: 'hits multiple targets', description: 'Fires multiple arrows' }
    ],
    appearance: {
      size: { width: 65, height: 105 },
      primaryColor: '#e0e0e0',
      secondaryColor: '#8b4513',
      aura: 'bone dust',
      glowEffect: false,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'basic',
      movementPattern: 'guard',
      attackPattern: 'ranged',
      spawnRate: 25,
      maxCount: 2
    },
    rarity: 'common',
    description: 'Skeletal archer with deadly accuracy',
    dialogue: ['Click... clack...', 'Target acquired...', 'Bones rattle...'],
    dropItems: ['bone arrow', 'bowstring'],
    experienceReward: 12
  }
];

// Humanoid Creatures
export const VILLAGER_VARIANTS: Creature[] = [
  {
    id: 'peaceful_villager',
    name: 'Peaceful Villager',
    type: 'villager',
    category: 'humanoid',
    stats: { health: 15, maxHealth: 15, attack: 0, defense: 1, speed: 3, intelligence: 5 },
    abilities: [
      { name: 'Offer Help', cost: 0, effect: 'gives items', description: 'Provides helpful items to player' },
      { name: 'Share Knowledge', cost: 0, effect: 'gives hints', description: 'Shares useful information' }
    ],
    appearance: {
      size: { width: 60, height: 100 },
      primaryColor: '#8b4513',
      secondaryColor: '#daa520',
      aura: 'warm glow',
      glowEffect: true,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'passive',
      intelligence: 'smart',
      movementPattern: 'patrol',
      attackPattern: 'melee',
      spawnRate: 45,
      maxCount: 2
    },
    rarity: 'common',
    description: 'Friendly villager who offers help and guidance',
    dialogue: [
      'Welcome, traveler!',
      'The words grow stronger each day.',
      'Have you seen any strange creatures?',
      'May your journey be blessed!'
    ],
    dropItems: ['healing potion', 'bread', 'coin'],
    experienceReward: 5
  },
  {
    id: 'scholar_villager',
    name: 'Scholar',
    type: 'scholar',
    category: 'humanoid',
    stats: { health: 12, maxHealth: 12, attack: 3, defense: 2, speed: 2, intelligence: 9 },
    abilities: [
      { name: 'Word of Power', cost: 10, damage: 25, description: 'Casts a powerful word spell' },
      { name: 'Enlighten', cost: 5, effect: 'increases player intelligence', description: 'Temporarily boosts mental abilities' }
    ],
    appearance: {
      size: { width: 55, height: 95 },
      primaryColor: '#4b0082',
      secondaryColor: '#daa520',
      aura: 'blue light',
      glowEffect: true,
      animationType: 'float'
    },
    behavior: {
      aggression: 'neutral',
      intelligence: 'genius',
      movementPattern: 'guard',
      attackPattern: 'magic',
      spawnRate: 60,
      maxCount: 1
    },
    rarity: 'rare',
    description: 'Wise scholar with knowledge of ancient words',
    dialogue: [
      'Knowledge is the greatest weapon.',
      'The ancient texts speak of great power...',
      'Words shape reality itself.',
      'Seek the truth in forgotten tomes.'
    ],
    dropItems: ['spell scroll', 'wisdom potion', 'ancient book'],
    experienceReward: 30
  },
  {
    id: 'guard_villager',
    name: 'Village Guard',
    type: 'guard',
    category: 'humanoid',
    stats: { health: 35, maxHealth: 35, attack: 18, defense: 6, speed: 4, intelligence: 4 },
    abilities: [
      { name: 'Sword Strike', cost: 0, damage: 18, description: 'Powerful sword attack' },
      { name: 'Defensive Stance', cost: 5, effect: 'increased defense', description: 'Raises shield for protection' },
      { name: 'Challenge', cost: 8, effect: 'forces attention', description: 'Forces enemies to target the guard' }
    ],
    appearance: {
      size: { width: 70, height: 115 },
      primaryColor: '#4682b4',
      secondaryColor: '#c0c0c0',
      aura: 'protective aura',
      glowEffect: false,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'neutral',
      intelligence: 'smart',
      movementPattern: 'patrol',
      attackPattern: 'melee',
      spawnRate: 40,
      maxCount: 2
    },
    rarity: 'uncommon',
    description: 'Stalwart guard protecting the village',
    dialogue: [
      'Halt! State your business.',
      'The village is under my protection.',
      'I sense danger in the air...',
      'Stay vigilant, traveler.'
    ],
    dropItems: ['iron sword', 'shield', 'guard token'],
    experienceReward: 20
  }
];

// Fantasy Creatures
export const DRAGON_VARIANTS: Creature[] = [
  {
    id: 'dictionary_dragon',
    name: 'Dictionary Dragon',
    type: 'dictionary_dragon',
    category: 'dragon',
    stats: { health: 150, maxHealth: 150, attack: 35, defense: 12, speed: 6, intelligence: 8 },
    abilities: [
      { name: 'Definition Breath', cost: 20, damage: 35, description: 'Breathes a stream of burning definitions' },
      { name: 'Word Hoard', cost: 15, effect: 'steals words', description: 'Hoards words from nearby sources' },
      { name: 'Ancient Knowledge', cost: 25, damage: 50, description: 'Unleashes forgotten words of power' }
    ],
    appearance: {
      size: { width: 200, height: 150 },
      primaryColor: '#8b0000',
      secondaryColor: '#ffd700',
      aura: 'golden text swirls',
      glowEffect: true,
      animationType: 'fly'
    },
    behavior: {
      aggression: 'aggressive',
      intelligence: 'genius',
      movementPattern: 'hunt',
      attackPattern: 'magic',
      spawnRate: 120,
      maxCount: 1
    },
    rarity: 'legendary',
    description: 'Massive dragon whose scales display ever-changing definitions',
    dialogue: [
      'I am the keeper of all words!',
      'Your vocabulary belongs to me!',
      'Tremble before my linguistic might!',
      'I have hoarded words for millennia!'
    ],
    dropItems: ['dragon scale', 'word gem', 'ancient dictionary'],
    experienceReward: 100
  },
  {
    id: 'baby_dragon',
    name: 'Wyrmling',
    type: 'dragon',
    category: 'dragon',
    stats: { health: 40, maxHealth: 40, attack: 20, defense: 4, speed: 7, intelligence: 5 },
    abilities: [
      { name: 'Fire Breath', cost: 10, damage: 20, description: 'Small burst of dragon fire' },
      { name: 'Claw Swipe', cost: 0, damage: 15, description: 'Quick claw attack' }
    ],
    appearance: {
      size: { width: 80, height: 60 },
      primaryColor: '#ff4500',
      secondaryColor: '#ffd700',
      aura: 'flame wisps',
      glowEffect: true,
      animationType: 'fly'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'smart',
      movementPattern: 'random',
      attackPattern: 'mixed',
      spawnRate: 35,
      maxCount: 2
    },
    rarity: 'rare',
    description: 'Young dragon with fiery temperament',
    dialogue: ['Rawr!', 'Little flames!', 'Growing strong!'],
    dropItems: ['small scale', 'fire essence'],
    experienceReward: 35
  }
];

// Magical Beings
export const MAGICAL_CREATURES: Creature[] = [
  {
    id: 'grammar_goblin',
    name: 'Grammar Goblin',
    type: 'grammar_goblin',
    category: 'fey',
    stats: { health: 18, maxHealth: 18, attack: 12, defense: 3, speed: 6, intelligence: 6 },
    abilities: [
      { name: 'Comma Slash', cost: 0, damage: 8, description: 'Attacks with sharpened punctuation' },
      { name: 'Sentence Scramble', cost: 12, effect: 'confuses target', description: 'Rearranges word order' },
      { name: 'Question Mark Hook', cost: 8, damage: 15, description: 'Hooks target with question mark weapon' }
    ],
    appearance: {
      size: { width: 50, height: 80 },
      primaryColor: '#228b22',
      secondaryColor: '#32cd32',
      aura: 'punctuation marks',
      glowEffect: true,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'smart',
      movementPattern: 'swarm',
      attackPattern: 'melee',
      spawnRate: 20,
      maxCount: 4
    },
    rarity: 'common',
    description: 'Mischievous goblin armed with weaponized punctuation',
    dialogue: ['Comma, comma, comma!', 'Your grammar is terrible!', 'Punctuation power!'],
    dropItems: ['punctuation shard', 'grammar scroll'],
    experienceReward: 15
  },
  {
    id: 'fairy',
    name: 'Word Fairy',
    type: 'fairy',
    category: 'fey',
    stats: { health: 10, maxHealth: 10, attack: 8, defense: 1, speed: 9, intelligence: 7 },
    abilities: [
      { name: 'Healing Words', cost: 10, effect: 'heals player', description: 'Speaks healing words' },
      { name: 'Sparkle Dust', cost: 5, damage: 8, description: 'Magical sparkling attack' },
      { name: 'Word Blessing', cost: 15, effect: 'boosts word power', description: 'Enhances vocabulary abilities' }
    ],
    appearance: {
      size: { width: 30, height: 50 },
      primaryColor: '#ff69b4',
      secondaryColor: '#ffd700',
      aura: 'sparkles',
      glowEffect: true,
      animationType: 'fly'
    },
    behavior: {
      aggression: 'passive',
      intelligence: 'smart',
      movementPattern: 'random',
      attackPattern: 'magic',
      spawnRate: 50,
      maxCount: 3
    },
    rarity: 'uncommon',
    description: 'Benevolent fairy that helps with word magic',
    dialogue: [
      'Words have power, dear one!',
      'Let me help you on your journey!',
      'Magic flows through language!',
      'Believe in the power of words!'
    ],
    dropItems: ['fairy dust', 'blessing charm', 'word crystal'],
    experienceReward: 8
  },
  {
    id: 'phoenix',
    name: 'Phrase Phoenix',
    type: 'phoenix',
    category: 'celestial',
    stats: { health: 80, maxHealth: 80, attack: 30, defense: 5, speed: 8, intelligence: 8 },
    abilities: [
      { name: 'Phoenix Fire', cost: 20, damage: 30, description: 'Blazing fire attack' },
      { name: 'Rebirth', cost: 50, effect: 'resurrects self', description: 'Returns to life when defeated' },
      { name: 'Inspiring Song', cost: 15, effect: 'boosts allies', description: 'Motivational phoenix call' }
    ],
    appearance: {
      size: { width: 120, height: 100 },
      primaryColor: '#ff6347',
      secondaryColor: '#ffd700',
      aura: 'flames and light',
      glowEffect: true,
      animationType: 'fly'
    },
    behavior: {
      aggression: 'neutral',
      intelligence: 'genius',
      movementPattern: 'patrol',
      attackPattern: 'magic',
      spawnRate: 90,
      maxCount: 1
    },
    rarity: 'epic',
    description: 'Majestic phoenix that speaks in inspiring phrases',
    dialogue: [
      'From ashes, words are reborn!',
      'The flame of language never dies!',
      'I am eternal, like great literature!',
      'Phoenix fire burns away ignorance!'
    ],
    dropItems: ['phoenix feather', 'flame essence', 'rebirth scroll'],
    experienceReward: 75
  }
];

// Monsters
export const MONSTER_VARIANTS: Creature[] = [
  {
    id: 'meaning_leech',
    name: 'Meaning Leech',
    type: 'meaning_leech',
    category: 'aberration',
    stats: { health: 22, maxHealth: 22, attack: 6, defense: 2, speed: 4, intelligence: 2 },
    abilities: [
      { name: 'Meaning Drain', cost: 0, damage: 6, effect: 'steals word meaning', description: 'Drains meaning from words' },
      { name: 'Ambiguity Cloud', cost: 8, effect: 'confuses', description: 'Creates confusing mist' },
      { name: 'Leech Bite', cost: 0, damage: 10, description: 'Draining bite attack' }
    ],
    appearance: {
      size: { width: 60, height: 40 },
      primaryColor: '#696969',
      secondaryColor: '#2f4f4f',
      aura: 'gray mist',
      glowEffect: false,
      animationType: 'slither'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'basic',
      movementPattern: 'hunt',
      attackPattern: 'special',
      spawnRate: 25,
      maxCount: 3
    },
    rarity: 'uncommon',
    description: 'Parasitic creature that feeds on word meanings',
    dialogue: ['Ssss...', 'Meaning... tasty...', 'Drain... drain...'],
    dropItems: ['leech essence', 'meaning fragment'],
    experienceReward: 18
  },
  {
    id: 'slime',
    name: 'Word Slime',
    type: 'slime',
    category: 'aberration',
    stats: { health: 35, maxHealth: 35, attack: 10, defense: 1, speed: 2, intelligence: 1 },
    abilities: [
      { name: 'Acid Spit', cost: 0, damage: 10, description: 'Corrosive slime projectile' },
      { name: 'Split', cost: 20, effect: 'creates copies', description: 'Divides into smaller slimes' },
      { name: 'Absorb', cost: 5, effect: 'gains health', description: 'Absorbs nearby matter' }
    ],
    appearance: {
      size: { width: 70, height: 50 },
      primaryColor: '#32cd32',
      secondaryColor: '#228b22',
      aura: 'bubbling',
      glowEffect: false,
      animationType: 'slither'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'mindless',
      movementPattern: 'random',
      attackPattern: 'ranged',
      spawnRate: 30,
      maxCount: 2
    },
    rarity: 'common',
    description: 'Gelatinous blob that consumes everything in its path',
    dialogue: ['Blub blub...', 'Absorb...', 'Consume...'],
    dropItems: ['slime gel', 'acid vial'],
    experienceReward: 12
  },
  {
    id: 'giant_spider',
    name: 'Web Weaver',
    type: 'spider',
    category: 'beast',
    stats: { health: 28, maxHealth: 28, attack: 16, defense: 4, speed: 7, intelligence: 3 },
    abilities: [
      { name: 'Venomous Bite', cost: 0, damage: 16, effect: 'poison', description: 'Poisonous spider bite' },
      { name: 'Web Trap', cost: 12, effect: 'immobilizes', description: 'Traps target in sticky web' },
      { name: 'Web Swing', cost: 5, effect: 'mobility', description: 'Swings on web for quick movement' }
    ],
    appearance: {
      size: { width: 85, height: 65 },
      primaryColor: '#800080',
      secondaryColor: '#4b0082',
      aura: 'web strands',
      glowEffect: false,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'basic',
      movementPattern: 'hunt',
      attackPattern: 'special',
      spawnRate: 28,
      maxCount: 2
    },
    rarity: 'uncommon',
    description: 'Large spider that weaves webs of words',
    dialogue: ['Click click...', 'Caught in my web...', 'Venomous words...'],
    dropItems: ['spider silk', 'venom sac', 'web strand'],
    experienceReward: 22
  }
];

// Wordvile Specific Creatures
export const WORDVILE_CREATURES: Creature[] = [
  {
    id: 'punctuation_poltergeist',
    name: 'Punctuation Poltergeist',
    type: 'punctuation_poltergeist',
    category: 'undead',
    stats: { health: 15, maxHealth: 15, attack: 14, defense: 0, speed: 8, intelligence: 4 },
    abilities: [
      { name: 'Punctuation Storm', cost: 15, damage: 20, description: 'Swirling storm of punctuation marks' },
      { name: 'Phase Through', cost: 8, effect: 'becomes intangible', description: 'Passes through attacks' },
      { name: 'Exclamation Blast', cost: 5, damage: 14, description: 'Explosive exclamation mark attack' }
    ],
    appearance: {
      size: { width: 45, height: 75 },
      primaryColor: '#ffffff',
      secondaryColor: '#000000',
      aura: 'floating punctuation',
      glowEffect: true,
      animationType: 'float'
    },
    behavior: {
      aggression: 'aggressive',
      intelligence: 'smart',
      movementPattern: 'random',
      attackPattern: 'magic',
      spawnRate: 22,
      maxCount: 3
    },
    rarity: 'uncommon',
    description: 'Ghostly spirit composed of floating punctuation marks',
    dialogue: ['!!!', '???', '...', '!?!?!'],
    dropItems: ['ghost essence', 'punctuation mark'],
    experienceReward: 16
  },
  {
    id: 'novel_nightmare',
    name: 'Novel Nightmare',
    type: 'novel_nightmare',
    category: 'aberration',
    stats: { health: 120, maxHealth: 120, attack: 40, defense: 8, speed: 5, intelligence: 7 },
    abilities: [
      { name: 'Genre Shift', cost: 25, damage: 30, effect: 'changes form', description: 'Shifts between literary genres' },
      { name: 'Plot Twist', cost: 20, damage: 35, description: 'Unexpected devastating attack' },
      { name: 'Character Arc', cost: 30, effect: 'evolves abilities', description: 'Develops new powers mid-battle' }
    ],
    appearance: {
      size: { width: 150, height: 120 },
      primaryColor: '#4b0082',
      secondaryColor: '#8b0000',
      aura: 'shifting text',
      glowEffect: true,
      animationType: 'float'
    },
    behavior: {
      aggression: 'aggressive',
      intelligence: 'genius',
      movementPattern: 'hunt',
      attackPattern: 'special',
      spawnRate: 150,
      maxCount: 1
    },
    rarity: 'legendary',
    description: 'Massive beast formed from corrupted narratives',
    dialogue: [
      'I am every story\'s dark ending!',
      'Plot armor cannot save you!',
      'This is where your story ends!',
      'I rewrite reality itself!'
    ],
    dropItems: ['nightmare essence', 'corrupted page', 'plot device'],
    experienceReward: 150
  },
  {
    id: 'redaction_cultist',
    name: 'Redaction Cultist',
    type: 'redaction_cultist',
    category: 'humanoid',
    stats: { health: 45, maxHealth: 45, attack: 22, defense: 6, speed: 4, intelligence: 6 },
    abilities: [
      { name: 'Censorship Beam', cost: 15, damage: 22, effect: 'removes words', description: 'Erases words from existence' },
      { name: 'Black Bar Shield', cost: 10, effect: 'blocks attacks', description: 'Protective censorship barrier' },
      { name: 'Redact Reality', cost: 25, damage: 35, description: 'Attempts to erase target from existence' }
    ],
    appearance: {
      size: { width: 75, height: 110 },
      primaryColor: '#000000',
      secondaryColor: '#8b0000',
      aura: 'black bars',
      glowEffect: false,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'smart',
      movementPattern: 'guard',
      attackPattern: 'magic',
      spawnRate: 40,
      maxCount: 2
    },
    rarity: 'rare',
    description: 'Hooded cultist wielding powers of censorship',
    dialogue: [
      '[REDACTED]',
      'Your words must be silenced!',
      'Censorship is protection!',
      'Some truths must be hidden!'
    ],
    dropItems: ['black essence', 'censorship scroll', 'cultist robe'],
    experienceReward: 40
  }
];

// Silver's Challenge Creatures
export const SILVER_CHALLENGE_CREATURES: Creature[] = [
  {
    id: 'money_hater',
    name: 'Money Hater',
    type: 'money_hater',
    category: 'aberration',
    stats: { health: 60, maxHealth: 60, attack: 25, defense: 5, speed: 5, intelligence: 4 },
    abilities: [
      { name: 'Value Devour', cost: 0, damage: 20, effect: 'destroys valuables', description: 'Consumes and destroys items of value' },
      { name: 'Wealth Drain', cost: 15, damage: 25, effect: 'steals resources', description: 'Drains money, gold, and respawn tokens' },
      { name: 'Greed Frenzy', cost: 20, damage: 30, effect: 'area damage', description: 'Destroys all nearby valuable items' }
    ],
    appearance: {
      size: { width: 90, height: 100 },
      primaryColor: '#2f4f2f',
      secondaryColor: '#8b4513',
      aura: 'consuming darkness',
      glowEffect: true,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'aggressive',
      intelligence: 'smart',
      movementPattern: 'hunt',
      attackPattern: 'special',
      spawnRate: 35,
      maxCount: 2
    },
    rarity: 'rare',
    description: 'Voracious creature that consumes all things of value',
    dialogue: [
      'Money... must destroy!',
      'Value means nothing!',
      'Consume all wealth!',
      'Your treasures are mine to devour!'
    ],
    dropItems: ['void essence', 'anti-value shard'],
    experienceReward: 45
  },
  {
    id: 'clanger',
    name: 'Clanger',
    type: 'clanger',
    category: 'construct',
    stats: { health: 80, maxHealth: 80, attack: 35, defense: 8, speed: 3, intelligence: 2 },
    abilities: [
      { name: 'Cymbal Crash', cost: 0, damage: 35, effect: 'stun', description: 'Smashes player between massive cymbals' },
      { name: 'Sonic Boom', cost: 20, damage: 40, effect: 'area damage', description: 'Creates devastating sound wave' },
      { name: 'Metallic Resonance', cost: 15, effect: 'defense boost', description: 'Vibrating metal increases defense' }
    ],
    appearance: {
      size: { width: 120, height: 140 },
      primaryColor: '#ffd700',
      secondaryColor: '#cd7f32',
      aura: 'sound waves',
      glowEffect: true,
      animationType: 'walk'
    },
    behavior: {
      aggression: 'hostile',
      intelligence: 'basic',
      movementPattern: 'patrol',
      attackPattern: 'melee',
      spawnRate: 45,
      maxCount: 1
    },
    rarity: 'rare',
    description: 'Massive musical construct that crushes victims with cymbals',
    dialogue: [
      'CLANG! CLANG!',
      'The music of destruction!',
      'CRASH!!!',
      'Feel the rhythm of pain!'
    ],
    dropItems: ['brass shard', 'resonance crystal', 'cymbal piece'],
    experienceReward: 55
  },
  {
    id: 'glitch',
    name: 'Little Glitch',
    type: 'glitch',
    category: 'aberration',
    stats: { health: 15, maxHealth: 15, attack: 18, defense: 1, speed: 9, intelligence: 5 },
    abilities: [
      { name: 'Reality Distort', cost: 0, damage: 12, effect: 'confusion', description: 'Makes objects behave erratically' },
      { name: 'Code Corruption', cost: 10, damage: 18, effect: 'disrupts abilities', description: 'Corrupts target abilities' },
      { name: 'Glitch Swarm', cost: 15, damage: 25, effect: 'multiplies', description: 'Creates temporary glitch copies' }
    ],
    appearance: {
      size: { width: 40, height: 35 },
      primaryColor: '#ff00ff',
      secondaryColor: '#00ff00',
      aura: 'digital static',
      glowEffect: true,
      animationType: 'teleport'
    },
    behavior: {
      aggression: 'aggressive',
      intelligence: 'smart',
      movementPattern: 'swarm',
      attackPattern: 'special',
      spawnRate: 15,
      maxCount: 5
    },
    rarity: 'uncommon',
    description: 'Small digital aberrations that corrupt reality itself',
    dialogue: [
      '01001010101!',
      'ERR0R! ERR0R!',
      'C0RRUPT3D!',
      'GL1TCH 1N TH3 M4TR1X!'
    ],
    dropItems: ['corrupted data', 'glitch fragment', 'error code'],
    experienceReward: 20
  }
];

// Combine all creatures
export const ALL_CREATURES: Creature[] = [
  ...ZOMBIE_VARIANTS,
  ...SKELETON_VARIANTS,
  ...VILLAGER_VARIANTS,
  ...DRAGON_VARIANTS,
  ...MAGICAL_CREATURES,
  ...MONSTER_VARIANTS,
  ...WORDVILE_CREATURES,
  ...SILVER_CHALLENGE_CREATURES,
  ...WORDVILE_LEGENDS,
  ...ALL_WORDVILE_CREATURES
];

// Creature lookup functions
export const getCreatureById = (id: string): Creature | undefined => {
  return ALL_CREATURES.find(creature => creature.id === id);
};

export const getCreaturesByType = (type: string): Creature[] => {
  return ALL_CREATURES.filter(creature => creature.type === type);
};

export const getCreaturesByCategory = (category: string): Creature[] => {
  return ALL_CREATURES.filter(creature => creature.category === category);
};

export const getCreaturesByRarity = (rarity: string): Creature[] => {
  return ALL_CREATURES.filter(creature => creature.rarity === rarity);
};

export const getRandomCreature = (filterFn?: (creature: Creature) => boolean): Creature => {
  const filtered = filterFn ? ALL_CREATURES.filter(filterFn) : ALL_CREATURES;
  return filtered[Math.floor(Math.random() * filtered.length)];
};

// Rarity-based spawn weights
const RARITY_WEIGHTS = {
  'common': 100,
  'uncommon': 50,
  'rare': 25,
  'epic': 10,
  'legendary': 5,
  'mythical': 3,
  'divine': 2,
  'extreme': 1,
  'universe': 0.5,
  'multiversal': 0.25,
  'all_realm_power': 0.1,
  'beyond_all_classifications': 0.05,
  'incomprehensible': 0.01
};

export const getRandomCreatureByRarity = (filterFn?: (creature: Creature) => boolean): Creature => {
  const filtered = filterFn ? ALL_CREATURES.filter(filterFn) : ALL_CREATURES;
  
  // Calculate total weight
  const totalWeight = filtered.reduce((sum, creature) => {
    return sum + (RARITY_WEIGHTS[creature.rarity] || 1);
  }, 0);
  
  // Random number between 0 and totalWeight
  let random = Math.random() * totalWeight;
  
  // Find the creature based on weighted random
  for (const creature of filtered) {
    random -= (RARITY_WEIGHTS[creature.rarity] || 1);
    if (random <= 0) {
      return creature;
    }
  }
  
  // Fallback (should never reach here)
  return filtered[0];
};
