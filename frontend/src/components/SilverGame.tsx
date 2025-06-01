// filepath: /home/toby/wordvile/frontend/src/components/SilverGame.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import '../styles/SilverGame.css';
import '../styles/SilverZombie.css';
import '../styles/SilverZombieDebug.css';
import '../styles/SilverEyeTracking.css';
import '../styles/SilverEnhanced.css';
import '../styles/CreatureSystem.css';
import '../styles/GameItems.css';
import { useEyeTracking } from '../hooks/useEyeTracking';
import { useCreatureManager } from '../hooks/useCreatureManager';
import { useItemManager } from '../hooks/useItemManager';
import { CreatureDisplay } from './CreatureDisplay';
import { GameItem } from './GameItem';
import { Creature } from '../types/creatures';
import { GameItem as GameItemType } from '../types/gameItems';
import WordvileGameEngine from './WordvileGameEngine';

interface Word {
  word: string;
  color: string;
  points: number; // In survival, these points are deducted from powerLevel
}

interface GameData {
  words: Word[];
}

// Define GameMode type
type GameMode = 'survival' | 'peaceful' | 'creative';

// Interface for Silver's character data
interface SilverCharacter {
  name: string;
  power: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  food: number;
  maxFood: number;
  oxygen: number;
  maxOxygen: number;
  temperature: number;
  creativity: number;
  imagination: number;
  abilities: { name: string; cost: number; description: string }[];
  log: string[];
  [key: string]: any; // For any additional properties
}

// Interface for zombie Silver attacks
interface ZombieAttack {
  targetIndex: number;
  timestamp: number;
  damage: number;
}

const SilverGame: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'round_over'>('playing');
  const [timeLeft, setTimeLeft] = useState(60);
  const [powerLevel, setPowerLevel] = useState(100);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('survival'); // Added gameMode state
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [silverChar, setSilverChar] = useState<SilverCharacter | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameEngineMode, setGameEngineMode] = useState(false); // Toggle between regular game and game engine
  
  // Zombie Silver states
  const [showZombie, setShowZombie] = useState(true); // Always show sliver
  const [zombiePosition, setZombiePosition] = useState({ x: 100, y: 100 }); // Fixed position
  const [zombieState, setZombieState] = useState<'idle' | 'entering' | 'attacking' | 'exiting' | 'teleporting' | 'laser_charging' | 'cannon_firing'>('idle');
  const [zombieAttacks, setZombieAttacks] = useState<ZombieAttack[]>([]);
  const [showDamageOverlay, setShowDamageOverlay] = useState(false);
  const [targetedWordIndex, setTargetedWordIndex] = useState<number | null>(null);
  
  // New Silver abilities states
  const [isCharging, setIsCharging] = useState(false);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [laserActive, setLaserActive] = useState(false);
  const [cannonsActive, setCannonsActive] = useState(false);
  const [slownessEffect, setSlownessEffect] = useState(false);
  const [sheikersActive, setSheikersActive] = useState(false);
  
  // Eye tracking states
  const [eyeContactDetected, setEyeContactDetected] = useState(false);
  const [eyeContactDuration, setEyeContactDuration] = useState(0);
  const [showEyeContactEffect, setShowEyeContactEffect] = useState(false);
  const [eyeTrackingDebug, setEyeTrackingDebug] = useState(false);
  
  // Debug stats
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeDistance, setEyeDistance] = useState(0);
  const [faceDetectionStats, setFaceDetectionStats] = useState({
    facesDetected: 0,
    distance: 0,
    isLooking: false
  });
  
  
  // Creature system states
  const [playerExperience, setPlayerExperience] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 300, y: 300 });
  const [playerLevel, setPlayerLevel] = useState(1);
  const [creatureDefeatCount, setCreatureDefeatCount] = useState(0);
  
  // Player and Linther poison states
  const [isLintherPoisoned, setIsLintherPoisoned] = useState(false);
  const [lintherPoisonLevel, setLintherPoisonLevel] = useState(0);
  const [hungerDecayRate, setHungerDecayRate] = useState(1); // Normal decay rate
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerMaxHealth] = useState(100);
  
  // Gaze tracking states
  const [gazePosition, setGazePosition] = useState({ x: 400, y: 300 });
  const [isGazeTracking, setIsGazeTracking] = useState(false);
  const [gazeSensitivity, setGazeSensitivity] = useState(12.0); // Much higher amplification factor
  
  // Refs - declare before use in hooks
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const zombieAttackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const zombieAppearanceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const zombieEyesRef = useRef<HTMLDivElement>(null);
  const eyeContactIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use eye tracking hook
  const {
    isTracking: eyeTrackingActive,
    isEyesOnScreen,
    eyePosition,
    isGreatLexiconActive,
    startTracking,
    stopTracking,
    setSensitivity
  } = useEyeTracking({
    targetElement: zombieEyesRef.current,
    autoStart: false,
    onEyesLost: () => {
      console.log('Eyes lost - Silver notices!');
      setEyeContactDetected(false);
    },
    onEyesFound: () => {
      console.log('Eyes returned - Silver is watching...');
    }
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Initialize items state first
  const [items, setItems] = useState<GameItemType[]>([]);

  // Creature management hook
  const {
    activeCreatures,
    spawnCreature,
    defeatCreature
  } = useCreatureManager({
    gameState,
    gameMode,
    words,
    items,
    containerRef: gameContainerRef as React.RefObject<HTMLDivElement>,
    onCreatureAttack: (damage: number, creatureId: string) => {
      // Handle creature attacks similar to zombie attacks
      if (gameMode === 'survival') {
        setPowerLevel(prev => Math.min(prev + damage, 100));
      } else {
        setScore(prev => Math.max(prev - damage, 0));
      }
    },
    onCreatureDefeat: (creature: Creature, experienceGained: number) => {
      // Handle creature defeat rewards
      setPlayerExperience(prev => prev + experienceGained);
      setCreatureDefeatCount(prev => prev + 1);
      setScore(prev => prev + experienceGained);
      
      // Level up check
      const newLevel = Math.floor((playerExperience + experienceGained) / 100) + 1;
      if (newLevel > playerLevel) {
        setPlayerLevel(newLevel);
      }
    }
  });

  // Creature click handler
  const handleCreatureClick = useCallback((spawnTime: number) => {
    defeatCreature(spawnTime);
  }, [defeatCreature]);
  
  // Item management
  const itemManager = useItemManager({
    gameState,
    containerRef: gameContainerRef as React.RefObject<HTMLDivElement>,
    activeCreatures,
    playerPosition,
    onItemCollected: (item: GameItemType) => {
      // Handle item collection
      setScore(prev => prev + item.value);
      if (item.type === 'health_potion' && gameMode === 'survival') {
        setPowerLevel(prev => Math.max(prev - 20, 0)); // Heal in survival mode
      }
      if (item.type === 'respawn_token') {
        // Store respawn token logic here
        console.log('Respawn token collected!');
      }
    },
    onPlayerHit: (damage: number) => {
      // Handle player being hit by Clanger
      if (gameMode === 'survival') {
        setPowerLevel(prev => Math.min(prev + damage, 100));
      } else {
        setScore(prev => Math.max(prev - damage, 0));
      }
    }
  });

  // Update items state when itemManager changes
  useEffect(() => {
    setItems(itemManager.items);
  }, [itemManager.items]);
  
  const { spawnItem, collectItem, showPlayer, setShowPlayer } = itemManager;

  // Update gaze position based on eye tracking
  useEffect(() => {
    if (eyePosition && gameContainerRef.current) {
      const containerRect = gameContainerRef.current.getBoundingClientRect();
      
      // Calculate gaze position relative to game container
      const relativeX = eyePosition.x - containerRect.left;
      const relativeY = eyePosition.y - containerRect.top;
      
      // Apply sensitivity
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      const offsetX = (relativeX - centerX) / centerX;
      const offsetY = (relativeY - centerY) / centerY;
      
      const scaledX = centerX + (offsetX * centerX * gazeSensitivity);
      const scaledY = centerY + (offsetY * centerY * gazeSensitivity);
      
      // Allow some overshoot beyond boundaries for better reach
      const maxOvershoot = 100;
      setGazePosition({
        x: Math.min(Math.max(scaledX, -maxOvershoot), containerRect.width + maxOvershoot),
        y: Math.min(Math.max(scaledY, -maxOvershoot), containerRect.height + maxOvershoot)
      });
      setIsGazeTracking(true);
    }
  }, [eyePosition, gazeSensitivity]);
  
  // Handle eye contact detection
  useEffect(() => {
    if (isEyesOnScreen && eyeTrackingActive && silverChar && gameState === 'playing' && !isGreatLexiconActive) {
      // Detect if looking at Silver
      if (zombieEyesRef.current && eyePosition) {
        const zombieRect = zombieEyesRef.current.getBoundingClientRect();
        const isLookingAt = eyePosition.x >= zombieRect.left && 
                           eyePosition.x <= zombieRect.right &&
                           eyePosition.y >= zombieRect.top &&
                           eyePosition.y <= zombieRect.bottom;
        
        setEyeContactDetected(isLookingAt);
        
        if (isLookingAt && !eyeContactIntervalRef.current) {
          // Start counting duration of eye contact
          let duration = 0;
          eyeContactIntervalRef.current = setInterval(() => {
            duration += 100;
            setEyeContactDuration(duration);
            
            // Every 1000ms (1 second) of eye contact, apply negative effects
            if (duration % 1000 === 0) {
              // Show visual effect
              setShowEyeContactEffect(true);
              setTimeout(() => setShowEyeContactEffect(false), 300);
              
              // Apply effects based on game mode
              if (gameMode === 'survival') {
                // In survival, increase power level (making it harder to win)
                setPowerLevel(prev => Math.min(prev + 3, 100));
              } else {
                // In other modes, reduce score
                setScore(prev => Math.max(prev - 2, 0));
              }
              
              // Reduce Silver's attributes
              setSilverChar(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  health: Math.max(prev.health - 1, 0),
                  food: Math.max(prev.food - 2, 0), // Get hungrier faster
                  stamina: Math.max(prev.stamina - 1, 0),
                };
              });
            }
          }, 100);
        } else if (!isLookingAt && eyeContactIntervalRef.current) {
          // Stop counting when not looking
          clearInterval(eyeContactIntervalRef.current);
          eyeContactIntervalRef.current = null;
          setEyeContactDuration(0);
        }
      }
    } else if (eyeContactIntervalRef.current) {
      // Clear interval if conditions aren't met
      clearInterval(eyeContactIntervalRef.current);
      eyeContactIntervalRef.current = null;
      setEyeContactDuration(0);
      setEyeContactDetected(false);
    }
  }, [isEyesOnScreen, eyeTrackingActive, eyePosition, silverChar, gameState, gameMode, isGreatLexiconActive]);
  // Update sensitivity when gazeSensitivity changes
  useEffect(() => {
    setSensitivity(gazeSensitivity);
  }, [gazeSensitivity, setSensitivity]);

  const fetchWords = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/words/silver`);
      setGameData(response.data);
      setWords(response.data.words.slice(0, 10)); // Initialize with a subset of words
    } catch (error) {
      console.error('Error fetching words:', error);
      setGameData({ words: [] }); // Ensure gameData is not null
      setWords([]);
    }
  }, [API_URL]);

  const fetchSilverData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/silver/state`);
      setSilverChar(response.data);
    } catch (error) {
      console.error('Error fetching Silver character data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);  // Zombie Silver logic - enhanced with supernatural abilities
  const handleZombieAppearance = useCallback(() => {
    if (gameState !== 'playing' || !gameContainerRef.current) return;

    // Don't trigger attacks in creative mode or when GREAT LEXICON is active
    if (gameMode === 'creative' || isGreatLexiconActive) return;

    // Silver's supernatural abilities sequence
    const abilities = ['teleport', 'laser_eyes', 'cannons', 'slowness_potion', 'sheikers'];
    const randomAbility = abilities[Math.floor(Math.random() * abilities.length)];
    
    switch(randomAbility) {
      case 'teleport':
        handleTeleportAttack();
        break;
      case 'laser_eyes':
        handleLaserEyeAttack();
        break;
      case 'cannons':
        handleCannonAttack();
        break;
      case 'slowness_potion':
        handleSlownessPotion();
        break;
      case 'sheikers':
        handleSheikersAttack();
        break;
      default:
        handleRegularAttack();
    }
  }, [gameState, gameMode, words, isGreatLexiconActive]);

  // Teleportation attack
  const handleTeleportAttack = useCallback(() => {
    if (!gameContainerRef.current) return;
    
    setIsTeleporting(true);
    setZombieState('teleporting');
    
    // Disappear with teleport effect
    setTimeout(() => {
      // Teleport to new random position
      const container = gameContainerRef.current!.getBoundingClientRect();
      const newX = Math.random() * (container.width - 200);
      const newY = Math.random() * (container.height - 200);
      setZombiePosition({ x: newX, y: newY });
      
      // Reappear and attack
      setTimeout(() => {
        setIsTeleporting(false);
        handleRegularAttack();
        setZombieState('idle');
      }, 500);
    }, 1000);
  }, []);

  // Laser eye attack
  const handleLaserEyeAttack = useCallback(() => {
    setLaserActive(true);
    setZombieState('laser_charging');
    
    // Charge up lasers
    setTimeout(() => {
      // Fire lasers at multiple words
      const targetCount = Math.min(3, words.length);
      for (let i = 0; i < targetCount; i++) {
        const targetIndex = Math.floor(Math.random() * words.length);
        const damage = Math.floor(Math.random() * 15) + 10;
        
        const attack = {
          targetIndex,
          timestamp: Date.now() + i * 100,
          damage
        };
        
        setZombieAttacks(prev => [...prev, attack]);
        
        setTimeout(() => {
          applyAttackDamage(attack);
        }, i * 200);
      }
      
      setLaserActive(false);
      setZombieState('idle');
    }, 2000);
  }, [words]);

  // Cannon attack
  const handleCannonAttack = useCallback(() => {
    setCannonsActive(true);
    setZombieState('cannon_firing');
    
    // Fire cannons in sequence
    const cannonCount = 3;
    for (let i = 0; i < cannonCount; i++) {
      setTimeout(() => {
        if (words.length > 0) {
          const targetIndex = Math.floor(Math.random() * words.length);
          const damage = Math.floor(Math.random() * 20) + 15;
          
          const attack = {
            targetIndex,
            timestamp: Date.now(),
            damage
          };
          
          setZombieAttacks(prev => [...prev, attack]);
          applyAttackDamage(attack);
        }
      }, i * 800);
    }
    
    setTimeout(() => {
      setCannonsActive(false);
      setZombieState('idle');
    }, 3000);
  }, [words]);

  // Slowness potion effect
  const handleSlownessPotion = useCallback(() => {
    setSlownessEffect(true);
    
    // Apply slowness to player (reduce score more on wrong clicks)
    setTimeout(() => {
      setSlownessEffect(false);
    }, 10000); // 10 second slowness effect
  }, []);

  // Sheikers attack (find and target words)
  const handleSheikersAttack = useCallback(() => {
    setSheikersActive(true);
    
    // Sheikers find and mark words for attack
    const targetCount = Math.min(5, words.length);
    const targets = [];
    
    for (let i = 0; i < targetCount; i++) {
      const targetIndex = Math.floor(Math.random() * words.length);
      targets.push(targetIndex);
      
      setTimeout(() => {
        const damage = Math.floor(Math.random() * 12) + 8;
        const attack = {
          targetIndex,
          timestamp: Date.now(),
          damage
        };
        
        setZombieAttacks(prev => [...prev, attack]);
        applyAttackDamage(attack);
      }, i * 600);
    }
    
    setTimeout(() => {
      setSheikersActive(false);
    }, 4000);
  }, [words]);

  // Regular attack fallback
  const handleRegularAttack = useCallback(() => {
    if (words.length === 0 || gameState !== 'playing') return;

    setZombieState('attacking');
    
    // Choose a random word to target
    const targetIndex = Math.floor(Math.random() * words.length);
    setTargetedWordIndex(targetIndex);
    
    // Calculate damage based on game mode
    const baseDamage = Math.floor(Math.random() * 10) + 5;
    const damage = gameMode === 'peaceful' ? Math.ceil(baseDamage / 2) : baseDamage;
    
    // Add the attack to the queue
    const attack = {
      targetIndex,
      timestamp: Date.now(),
      damage
    };
    
    setZombieAttacks(prev => [...prev, attack]);
    
    // Show damage effects
    setShowDamageOverlay(true);
    setTimeout(() => setShowDamageOverlay(false), 500);
    
    // Apply damage after delay (for animation to complete)
    zombieAttackTimeoutRef.current = setTimeout(() => {
      applyAttackDamage(attack);
    }, 800);
    
    // Return to idle state after attack
    setTimeout(() => {
      setZombieState('idle');
    }, 2000);
  }, [gameState, gameMode, words]);

  // Helper function to apply attack damage
  const applyAttackDamage = useCallback((attack: { targetIndex: number; timestamp: number; damage: number }) => {
    if (gameState !== 'playing') return;
    
    // Apply different effects based on game mode (unless GREAT LEXICON is active)
    if (gameMode === 'survival' && !isGreatLexiconActive) {
      setPowerLevel(prev => Math.min(prev + attack.damage, 100));
    } else {
      setScore(prev => Math.max(prev - attack.damage, 0));
    }
    
    // Reset targeted word
    setTargetedWordIndex(null);
    setZombieAttacks(prev => prev.filter(a => a.timestamp !== attack.timestamp));
  }, [gameState, gameMode, isGreatLexiconActive]);

  const initiateZombieAttack = useCallback(() => {
    if (words.length === 0 || gameState !== 'playing') return;

    // Choose a random word to target
    const targetIndex = Math.floor(Math.random() * words.length);
    setTargetedWordIndex(targetIndex);
    
    // Calculate damage based on game mode
    const baseDamage = Math.floor(Math.random() * 10) + 5;
    const damage = gameMode === 'peaceful' ? Math.ceil(baseDamage / 2) : baseDamage;
    
    // Add the attack to the queue
    const attack: ZombieAttack = {
      targetIndex,
      timestamp: Date.now(),
      damage
    };
    
    setZombieAttacks(prev => [...prev, attack]);
    
    // Show damage effects
    setShowDamageOverlay(true);
    setTimeout(() => setShowDamageOverlay(false), 500);
    
    // Apply damage after delay (for animation to complete)
    zombieAttackTimeoutRef.current = setTimeout(() => {
      applyZombieAttackDamage(attack);
    }, 800);
  }, [words, gameState, gameMode]);

  const applyZombieAttackDamage = useCallback((attack: ZombieAttack) => {
    // Cancel if the game is no longer playing
    if (gameState !== 'playing') return;
    
    // Apply different effects based on game mode (unless GREAT LEXICON is active)
    if (gameMode === 'survival' && !isGreatLexiconActive) {
      // In survival mode, increase power level (making it harder to win)
      setPowerLevel(prev => Math.min(prev + attack.damage, 100));
    } else {
      // In other modes, reduce score
      setScore(prev => Math.max(prev - attack.damage, 0));
    }
    
    // Reset targeted word
    setTargetedWordIndex(null);
    
    // Remove the attack from the queue
    setZombieAttacks(prev => prev.filter(a => a.timestamp !== attack.timestamp));
  }, [gameState, gameMode, isGreatLexiconActive]);

  // Set up recurring zombie attacks (sliver is always visible)
  useEffect(() => {
    if (gameState === 'playing' && (gameMode === 'survival' || gameMode === 'peaceful')) {
      // Schedule first attack after a delay
      const initialDelay = gameMode === 'peaceful' ? 15000 : 10000;
      
      const initialTimer = setTimeout(() => {
        handleZombieAppearance();
        
        // Then set up interval for recurring attacks
        const interval = gameMode === 'peaceful' ? 25000 : 15000;
        zombieAppearanceIntervalRef.current = setInterval(handleZombieAppearance, interval);
      }, initialDelay);
      
      return () => {
        clearTimeout(initialTimer);
        if (zombieAppearanceIntervalRef.current) {
          clearInterval(zombieAppearanceIntervalRef.current);
        }
        if (zombieAttackTimeoutRef.current) {
          clearTimeout(zombieAttackTimeoutRef.current);
        }
      };
    }
  }, [gameState, gameMode, handleZombieAppearance]);

  // Clean up zombie state when game state changes (but keep sliver visible)
  useEffect(() => {
    if (gameState !== 'playing') {
      // Don't hide the sliver, just stop attacks and reset state
      setZombieAttacks([]);
      setTargetedWordIndex(null);
      setZombieState('idle');
      if (zombieAppearanceIntervalRef.current) {
        clearInterval(zombieAppearanceIntervalRef.current);
      }
      if (zombieAttackTimeoutRef.current) {
        clearTimeout(zombieAttackTimeoutRef.current);
      }
      if (eyeContactIntervalRef.current) {
        clearInterval(eyeContactIntervalRef.current);
      }
      // Eye tracking is now managed by the hook
    }
  }, [gameState, eyeTrackingActive]);
  
  
  // Eye tracking for player position (fallback to mouse if no eye tracking)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only use mouse position if eye tracking is not active
      if (!eyeTrackingActive && gameContainerRef.current) {
        const rect = gameContainerRef.current.getBoundingClientRect();
        setPlayerPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [eyeTrackingActive]);
  
  // Update player position to follow gaze when eye tracking is active
  useEffect(() => {
    if (isGazeTracking && eyeTrackingActive && gameContainerRef.current) {
      const containerRect = gameContainerRef.current.getBoundingClientRect();
      // Clamp player position to game boundaries (no overshoot for player)
      setPlayerPosition({
        x: Math.min(Math.max(gazePosition.x, 0), containerRect.width),
        y: Math.min(Math.max(gazePosition.y, 0), containerRect.height)
      });
    }
  }, [gazePosition, isGazeTracking, eyeTrackingActive]);
  
  // Proximity detection and Linther poison effect
  useEffect(() => {
    if (gameState !== 'playing' || !showZombie || isGreatLexiconActive) return;
    
    // Calculate distance to Silver
    const dx = playerPosition.x - zombiePosition.x;
    const dy = playerPosition.y - zombiePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Linther poison threshold (adjust as needed)
    const LINTHER_PROXIMITY_THRESHOLD = 150;
    
    if (distance < LINTHER_PROXIMITY_THRESHOLD) {
      // Apply Linther poison
      if (!isLintherPoisoned) {
        setIsLintherPoisoned(true);
      }
      
      // Increase poison level based on proximity
      const poisonIntensity = 1 - (distance / LINTHER_PROXIMITY_THRESHOLD);
      setLintherPoisonLevel(poisonIntensity);
      
      // Increase hunger decay rate
      setHungerDecayRate(1 + poisonIntensity * 2); // Up to 3x normal decay when very close
    } else {
      // Clear poison when far enough
      if (isLintherPoisoned) {
        setIsLintherPoisoned(false);
        setLintherPoisonLevel(0);
        setHungerDecayRate(1);
      }
    }
  }, [playerPosition, zombiePosition, gameState, showZombie, isLintherPoisoned, isGreatLexiconActive]);
  
  // Apply hunger decay with Linther effect
  useEffect(() => {
    if (gameState !== 'playing' || !silverChar || isGreatLexiconActive) return;
    
    const hungerInterval = setInterval(() => {
      setSilverChar(prev => {
        if (!prev) return prev;
        const newFood = Math.max(prev.food - hungerDecayRate, 0);
        
        // Starve if food reaches 0
        if (newFood === 0 && prev.health > 0) {
          return {
            ...prev,
            food: newFood,
            health: Math.max(prev.health - 5, 0) // Lose health when starving
          };
        }
        
        return {
          ...prev,
          food: newFood
        };
      });
      
      // Also damage player if poisoned
      if (isLintherPoisoned) {
        const poisonDamage = Math.ceil(lintherPoisonLevel * 2); // 0-2 damage based on poison level
        setPlayerHealth(prev => Math.max(prev - poisonDamage, 0));
      }
    }, 1000); // Update every second
    
    return () => clearInterval(hungerInterval);
  }, [gameState, silverChar, hungerDecayRate, isLintherPoisoned, lintherPoisonLevel, isGreatLexiconActive]);

  
  

  // Start eye tracking with target element when zombie is visible
  useEffect(() => {
    if (showZombie && zombieEyesRef.current) {
      startTracking();
    }
    
    return () => {
      if (eyeContactIntervalRef.current) {
        clearInterval(eyeContactIntervalRef.current);
      }
    };
  }, [showZombie, startTracking]);

  // Pause game when GREAT LEXICON is active
  useEffect(() => {
    if (isGreatLexiconActive && gameState === 'playing') {
      console.log('GREAT LEXICON ACTIVE - Pausing game!');
      // You could set a paused state here if needed
      // For now, we'll just prevent game actions in other effects
    }
  }, [isGreatLexiconActive, gameState]);

  // If game engine mode is active, show the Wordvile Game Engine
  if (gameEngineMode) {
    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setGameEngineMode(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Back to Silver's Challenge
        </button>
        <WordvileGameEngine />
      </div>
    );
  }

  return (
    <div className="game-container" ref={gameContainerRef}>
      <div className="silver-character">
        {silverChar && (
          <>
            <div className="character-stats">
              <div>Health: {silverChar.health}</div>
              <div>Power: {silverChar.power}</div>
              <div>Food: {silverChar.food}</div>
              <div>Stamina: {silverChar.stamina}</div>
              <div>Oxygen: {silverChar.oxygen}</div>
              <div>Temperature: {silverChar.temperature}</div>
              <div>Creativity: {silverChar.creativity}</div>
              <div>Imagination: {silverChar.imagination}</div>
            </div>
            <div className="character-abilities">
              {silverChar.abilities && silverChar.abilities.map((ability, index) => (
                <div key={index} className="ability">
                  <div className="ability-name">{ability.name}</div>
                  <div className="ability-cost">Cost: {ability.cost}</div>
                  <div className="ability-description">{ability.description}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="game-info">
        <div>Score: {score}</div>
        <div>Time Left: {timeLeft}s</div>
        <div>Power Level: {powerLevel}%</div>
        <div style={{ color: playerHealth < 30 ? '#ff0000' : '#ffffff' }}>
          Player Health: {playerHealth}/{playerMaxHealth}
        </div>
        <div>Player Level: {playerLevel}</div>
        <div>Experience: {playerExperience}/100</div>
        <div>Creatures Defeated: {creatureDefeatCount}</div>
        <div>Active Creatures: {activeCreatures.length}</div>
        {gameMode !== 'creative' && (
          <div>Mode: {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}</div>
        )}
        {isLintherPoisoned && (
          <div className="linther-poison-status" style={{ color: '#9d4edd' }}>
            ⚠️ LINTHER POISONED! (Level: {Math.round(lintherPoisonLevel * 100)}%)
          </div>
        )}
        {silverChar && (
          <div style={{ color: silverChar.food < 20 ? '#ff0000' : '#ffffff' }}>
            Hunger Decay: {hungerDecayRate.toFixed(1)}x
          </div>
        )}
      </div>
      
      <div className="word-container">
        {words && words.length > 0 && words.map((word, index) => (
          <div key={index} className="word" style={{ color: word.color }}>
            {word.word}
          </div>
        ))}
      </div>
      
      {showZombie && (
        <div className="zombie-silver-container" style={{ 
          left: `${zombiePosition.x}px`, 
          top: `${zombiePosition.y}px`,
          opacity: zombieState === 'exiting' ? 0 : 1
        }}>
          {/* Silver's Health Bar */}
          {silverChar && (
            <div className="entity-health-bar" style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(silverChar.health / 100) * 100}%`,
                height: '100%',
                backgroundColor: silverChar.health > 50 ? '#4CAF50' : silverChar.health > 25 ? '#ff9800' : '#f44336',
                transition: 'width 0.3s ease-in-out'
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '8px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {silverChar.health}/100
              </div>
            </div>
          )}
          <div className="zombie-silver t-shaped-form">
            {/* Power Generator at Bottom */}
            <div className="power-generator">
              <div className="generator-core"></div>
              <div className="generator-energy-lines"></div>
            </div>
            
            {/* T-Shaped Rocky Body with Armor */}
            <div className="t-shaped-body">
              <div className="body-armor"></div>
              <div className="rocky-texture"></div>
              
              {/* Horizontal T-Bar with 3 Heads */}
              <div className="t-bar">
                {/* Left Head */}
                <div className="silver-head left-head">
                  <div className="head-armor"></div>
                  <div className="laser-eyes">
                    <div className="laser-eye left"></div>
                    <div className="laser-eye right"></div>
                  </div>
                  <div className="bone-saw-parts">
                    <div className="bone-part spinning-saw part1"></div>
                    <div className="bone-part spinning-saw part2"></div>
                  </div>
                  <div className="cannon left-cannon"></div>
                </div>
                
                {/* Center Head (Main) */}
                <div className="silver-head center-head main-head">
                  <div className="head-armor main-armor"></div>
                  <div className="laser-eyes primary">
                    <div className="laser-eye left primary"></div>
                    <div className="laser-eye right primary"></div>
                  </div>
                  <div className="bone-saw-parts">
                    <div className="bone-part spinning-saw part1"></div>
                    <div className="bone-part spinning-saw part2"></div>
                  </div>
                  <div className="teleport-aura"></div>
                  <div className="zombie-eyes" ref={zombieEyesRef}>
                    {eyeTrackingActive && (
                      <div className="gaze-point" style={{ 
                        left: `${faceDetectionStats.distance}px`, 
                        top: `${faceDetectionStats.distance}px`,
                        transition: 'none'
                      }} />
                    )}
                  </div>
                </div>
                
                {/* Right Head */}
                <div className="silver-head right-head">
                  <div className="head-armor"></div>
                  <div className="laser-eyes">
                    <div className="laser-eye left"></div>
                    <div className="laser-eye right"></div>
                  </div>
                  <div className="bone-saw-parts">
                    <div className="bone-part spinning-saw part1"></div>
                    <div className="bone-part spinning-saw part2"></div>
                  </div>
                  <div className="cannon right-cannon"></div>
                </div>
              </div>
            </div>
            
            {/* Sheikers (Helper Entities) */}
            <div className="sheikers">
              <div className="sheiker sheiker1"></div>
              <div className="sheiker sheiker2"></div>
              <div className="sheiker sheiker3"></div>
            </div>
            
            {/* Shadowy Aura */}
            <div className="shadowy-aura"></div>
            
            {/* Potion Effects */}
            <div className="potion-effects">
              <div className="slowness-potion-aura"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Creature System */}
      {activeCreatures && activeCreatures.length > 0 && activeCreatures.map(creatureSpawn => (
        <CreatureDisplay 
          key={creatureSpawn.spawnTime}
          creatureSpawn={creatureSpawn}
          onClick={() => handleCreatureClick(creatureSpawn.spawnTime)}
        />
      ))}
      
      {/* Render game items */}
      {itemManager.items && itemManager.items.length > 0 && itemManager.items.map(item => (
        <GameItem
          key={item.id}
          item={item}
          onClick={() => collectItem(item.id)}
        />
      ))}
      
      {/* Render player indicator */}
      {showPlayer && (
        <div 
          className="player-indicator"
          style={{
            left: `${playerPosition.x}px`,
            top: `${playerPosition.y}px`
          }}
          onMouseDown={(e) => {
            const startX = e.clientX - playerPosition.x;
            const startY = e.clientY - playerPosition.y;
            
            const handleMouseMove = (e: MouseEvent) => {
              setPlayerPosition({
                x: e.clientX - startX,
                y: e.clientY - startY
              });
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          P
        </div>
      )}
      
      {showDamageOverlay && targetedWordIndex !== null && (
        <div className="damage-overlay">
          -{words[targetedWordIndex].points}
        </div>
      )}
      
      {gameState === 'won' && (
        <div className="game-over">
          <div>You Won!</div>
          <div>Final Score: {score}</div>
        </div>
      )}
      
      {gameState === 'lost' && (
        <div className="game-over">
          <div>You Lost!</div>
          <div>Final Score: {score}</div>
        </div>
      )}
      
      <div className="controls">
        <button onClick={fetchWords}>Fetch New Words</button>
        <button onClick={fetchSilverData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Silver Data'}
        </button>
        <button 
          onClick={() => setGameEngineMode(true)}
          style={{
            backgroundColor: '#4B0082',
            color: '#FFD700',
            fontWeight: 'bold',
            border: '2px solid #FFD700',
            boxShadow: '0 0 10px #FFD700'
          }}
        >
          🌟 Enter GREAT LEXICON Quest 🌟
        </button>
        
        {/* Debug controls to spawn new creatures */}
        <div className="debug-creature-spawn" style={{ marginTop: '10px' }}>
          <button 
            onClick={() => spawnCreature('money_hater')} 
            style={{ backgroundColor: '#2f4f2f', color: 'white', margin: '2px' }}
          >
            Spawn Money Hater
          </button>
          <button 
            onClick={() => spawnCreature('clanger')} 
            style={{ backgroundColor: '#ffd700', color: 'black', margin: '2px' }}
          >
            Spawn Clanger
          </button>
          <button 
            onClick={() => spawnCreature('glitch')} 
            style={{ backgroundColor: '#ff00ff', color: 'white', margin: '2px' }}
          >
            Spawn Glitch
          </button>
        </div>
        
        {/* Debug controls to spawn legendary creatures */}
        <div className="debug-legendary-spawn" style={{ marginTop: '10px' }}>
          <button 
            onClick={() => spawnCreature('the_great_lexicon')} 
            style={{ backgroundColor: '#FFD700', color: '#4B0082', margin: '2px', fontWeight: 'bold' }}
          >
            Spawn GREAT LEXICON
          </button>
          <button 
            onClick={() => spawnCreature('silver_hero')} 
            style={{ backgroundColor: '#C0C0C0', color: 'black', margin: '2px' }}
          >
            Spawn Silver
          </button>
          <button 
            onClick={() => spawnCreature('synonym_dragon')} 
            style={{ backgroundColor: '#FF6347', color: 'white', margin: '2px' }}
          >
            Spawn Synonym Dragon
          </button>
          <button 
            onClick={() => spawnCreature('mind_poisoner')} 
            style={{ backgroundColor: '#8B008B', color: 'white', margin: '2px' }}
          >
            Spawn Mind Poisoner
          </button>
        </div>
        
        {/* Debug controls to spawn items */}
        <div className="debug-item-spawn" style={{ marginTop: '10px' }}>
          <button 
            onClick={() => spawnItem('coin')} 
            style={{ backgroundColor: '#ffd700', color: 'black', margin: '2px' }}
          >
            Spawn Coin
          </button>
          <button 
            onClick={() => spawnItem('diamond')} 
            style={{ backgroundColor: '#b9f2ff', color: 'black', margin: '2px' }}
          >
            Spawn Diamond
          </button>
          <button 
            onClick={() => spawnItem('respawn_token')} 
            style={{ backgroundColor: '#90ee90', color: 'black', margin: '2px' }}
          >
            Spawn Token
          </button>
        </div>
      </div>
      
      <div className="settings">
        <div>
          <label>Game Mode:</label>
          <select value={gameMode} onChange={e => setGameMode(e.target.value as GameMode)}>
            <option value="survival">Survival</option>
            <option value="peaceful">Peaceful</option>
            <option value="creative">Creative</option>
          </select>
        </div>
        <div>
          <label>Eye Tracking Debug:</label>
          <input 
            type="checkbox" 
            checked={eyeTrackingDebug} 
            onChange={e => setEyeTrackingDebug(e.target.checked)} 
          />
        </div>
        {eyeTrackingActive && (
          <div>
            <label>Gaze Sensitivity:</label>
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="0.5"
              value={gazeSensitivity} 
              onChange={e => setGazeSensitivity(parseFloat(e.target.value))} 
            />
            <span>{gazeSensitivity.toFixed(1)}x</span>
          </div>
        )}
      </div>
      
      {/* Eye Tracking Status */}
      <div className="camera-status" style={{ 
        marginTop: '10px', 
        padding: '10px', 
        border: `2px solid ${eyeTrackingActive ? '#4CAF50' : '#f44336'}`,
        borderRadius: '8px',
        backgroundColor: eyeTrackingActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
      }}>
        <h4>Eye Tracking Status:</h4>
        {eyeTrackingActive ? (
          <div style={{ color: '#4CAF50' }}>
            ✅ Eye tracking active - {isEyesOnScreen ? 'Eyes detected' : 'Eyes not detected'}
            {isGreatLexiconActive && (
              <div style={{ color: '#ff0000', fontWeight: 'bold', marginTop: '5px' }}>
                ⚠️ GREAT LEXICON ACTIVE - Look at the screen!
              </div>
            )}
            {eyeTrackingDebug && eyePosition && (
              <div style={{ marginTop: '5px', fontSize: '0.8rem' }}>
                Eye Position: ({eyePosition.x.toFixed(0)}, {eyePosition.y.toFixed(0)}) |
                Gaze: ({gazePosition.x.toFixed(0)}, {gazePosition.y.toFixed(0)})
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ color: '#f44336', marginBottom: '10px' }}>
              ❌ Eye tracking not active
            </div>
            <button 
              onClick={startTracking}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              👁️ Start Eye Tracking
            </button>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <h3>Calibration Guide:</h3>
        <ol style={{ paddingLeft: '20px', fontSize: '0.8rem' }}>
          <li>Make sure your face is well-lit</li>
          <li>Look at the corners of the game area to calibrate range</li>
          <li>Adjust "Gaze Sensitivity" if movement is too small/large</li>
          <li>Try to stay at a consistent distance from camera</li>
          <li>Small head movements = large cursor movements</li>
        </ol>
        {eyeTrackingActive && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(0, 255, 255, 0.1)', borderRadius: '5px' }}>
            <strong>Tip:</strong> Move your head slightly left/right and up/down. The gaze should amplify your movements by {gazeSensitivity.toFixed(1)}x
          </div>
        )}
      </div>
      
      {/* Player cursor visualization (always visible) */}
      <div 
        className="player-cursor"
        style={{
          position: 'absolute',
          left: `${playerPosition.x}px`,
          top: `${playerPosition.y}px`,
          width: eyeTrackingDebug ? '30px' : '20px',
          height: eyeTrackingDebug ? '30px' : '20px',
          borderRadius: '50%',
          backgroundColor: isLintherPoisoned ? '#9d4edd' : '#00ff00',
          border: '3px solid white',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 9998,
          boxShadow: isLintherPoisoned ? `0 0 ${20 * lintherPoisonLevel}px #9d4edd` : '0 0 10px rgba(0, 255, 0, 0.5)',
          transition: 'all 0.1s ease-out'
        }}
      >
        {/* Always show player label */}
        <div style={{
          position: 'absolute',
          top: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          color: 'white',
          whiteSpace: 'nowrap',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '3px 8px',
          borderRadius: '4px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9)'
        }}>
          PLAYER {eyeTrackingActive ? '(👁️)' : '(🖱️)'}
        </div>
        {/* Player Health Bar */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70px',
          height: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid rgba(255, 255, 255, 0.7)',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(playerHealth / playerMaxHealth) * 100}%`,
            height: '100%',
            backgroundColor: playerHealth > 50 ? '#4CAF50' : playerHealth > 25 ? '#ff9800' : '#f44336',
            transition: 'width 0.3s ease-in-out'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9)'
          }}>
            {playerHealth}/{playerMaxHealth}
          </div>
        </div>
        {/* Inner glow effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: 'white',
          transform: 'translate(-50%, -50%)',
          opacity: 0.8
        }} />
      </div>
      
      {/* Gaze indicator (always visible when eye tracking) */}
      {isGazeTracking && (
        <div 
          className="gaze-indicator"
          style={{
            position: 'absolute',
            left: `${gazePosition.x}px`,
            top: `${gazePosition.y}px`,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: '3px dashed #00ffff',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            zIndex: 9997,
            animation: 'gazeRotate 4s linear infinite'
          }}
        >
          {/* Gaze label */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            color: '#00ffff',
            whiteSpace: 'nowrap',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9)'
          }}>
            GAZE POINT
          </div>
          {/* Center dot */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#00ffff',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px #00ffff'
          }} />
          {/* Crosshair lines */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0',
            height: '1px',
            backgroundColor: '#00ffff',
            opacity: 0.5
          }} />
          <div style={{
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '50%',
            width: '1px',
            backgroundColor: '#00ffff',
            opacity: 0.5
          }} />
        </div>
      )}
      
      {/* Linther poison visual effect */}
      {isLintherPoisoned && (
        <div 
          className="linther-poison-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${playerPosition.x}px ${playerPosition.y}px, 
              rgba(157, 78, 221, ${0.3 * lintherPoisonLevel}) 0%, 
              transparent 40%)`,
            zIndex: 9997,
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      )}
      
      {/* Linther poison particles effect around Silver */}
      {isLintherPoisoned && showZombie && (
        <div 
          className="linther-particles"
          style={{
            position: 'absolute',
            left: `${zombiePosition.x}px`,
            top: `${zombiePosition.y}px`,
            width: '300px',
            height: '300px',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9996
          }}
        >
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                backgroundColor: '#9d4edd',
                borderRadius: '50%',
                left: '50%',
                top: '50%',
                transform: `rotate(${i * 36}deg) translateX(${50 + Math.random() * 100}px)`,
                opacity: lintherPoisonLevel * 0.8,
                animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* GREAT LEXICON overlay */}
      {isGreatLexiconActive && (
        <div 
          className="great-lexicon-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          <div style={{
            textAlign: 'center',
            color: '#ff0000',
            textShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
            animation: 'float 3s ease-in-out infinite'
          }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>GREAT LEXICON ACTIVATED</h1>
            <p style={{ fontSize: '2rem' }}>LOOK AT THE SCREEN!</p>
            <p style={{ fontSize: '1.5rem', marginTop: '2rem' }}>Game paused until you return your gaze...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the SilverGame component as default
export default SilverGame;
