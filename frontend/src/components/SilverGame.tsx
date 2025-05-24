// filepath: /home/toby/wordvile/frontend/src/components/SilverGame.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import '../styles/SilverGame.css';
import '../styles/SilverZombie.css';
import '../styles/SilverZombieDebug.css';
import '../styles/SilverEyeTracking.css';
import '../styles/SilverEnhanced.css';
import '../styles/CreatureSystem.css';
import MediaPipeEyeTracker, { FaceDetection } from '../utils/MediaPipeEyeTracker';
import { useCreatureManager } from '../hooks/useCreatureManager';
import { CreatureDisplay } from './CreatureDisplay';
import { Creature } from '../types/creatures';

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
  const [eyeTrackingActive, setEyeTrackingActive] = useState(false);
  const [eyeContactDetected, setEyeContactDetected] = useState(false);
  const [eyeContactDuration, setEyeContactDuration] = useState(0);
  const [showEyeContactEffect, setShowEyeContactEffect] = useState(false);
  const [cameraAccessGranted, setCameraAccessGranted] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [eyeTrackingDebug, setEyeTrackingDebug] = useState(false);
  const [eyeTrackingInitializing, setEyeTrackingInitializing] = useState(false);
  
  // Debug stats
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeDistance, setEyeDistance] = useState(0);
  const [eyeThreshold, setEyeThreshold] = useState(100);
  const [faceDetectionStats, setFaceDetectionStats] = useState({
    facesDetected: 0,
    distance: 0,
    isLooking: false
  });
  
  // Creature system states
  const [playerExperience, setPlayerExperience] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [creatureDefeatCount, setCreatureDefeatCount] = useState(0);
  
  // Refs
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const zombieAttackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const zombieAppearanceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const zombieEyesRef = useRef<HTMLDivElement>(null);
  const eyeContactIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.REACT_APP_API_URL;

  // Creature management hook
  const {
    activeCreatures,
    spawnCreature,
    defeatCreature
  } = useCreatureManager({
    gameState,
    gameMode,
    words,
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

  // Eye tracking handlers
  const handleEyeContact = useCallback((isLookingAt: boolean) => {
    setEyeContactDetected(isLookingAt);
    
    // Update debug stats
    if (eyeTrackingDebug) {
      setFaceDetectionStats(prev => ({
        ...prev,
        isLooking: isLookingAt
      }));
    }
    
    if (isLookingAt && silverChar && gameState === 'playing') {
      // Start counting duration of eye contact
      if (!eyeContactIntervalRef.current) {
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
            if (silverChar) {
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
          }
        }, 100);
      }
    } else {
      // Stop counting duration when not looking
      if (eyeContactIntervalRef.current) {
        clearInterval(eyeContactIntervalRef.current);
        eyeContactIntervalRef.current = null;
        setEyeContactDuration(0);
      }
    }
  }, [silverChar, gameState, gameMode, eyeTrackingDebug]);
  
  // Initialize MediaPipe eye tracking
  const setupEyeTracking = useCallback(async () => {
    setEyeTrackingInitializing(true);
    setCameraPermissionError(null);
    
    try {
      console.log('Setting up MediaPipe eye tracking...');
      
      const initialized = await MediaPipeEyeTracker.initialize({
        onEyeContact: (isLookingAt: boolean) => {
          handleEyeContact(isLookingAt);
        },
        onInitialized: () => {
          setCameraAccessGranted(true);
          setCameraPermissionError(null);
          setEyeTrackingInitializing(false);
          console.log('✓ MediaPipe eye tracking initialized successfully');
        },
        onError: (error: { message: string }) => {
          console.error('✗ MediaPipe eye tracking error:', error);
          setCameraAccessGranted(false);
          setCameraPermissionError(error.message);
          setEyeTrackingInitializing(false);
        },
        onDetection: (detections: FaceDetection[]) => {
          // Update face detection stats for debug display
          if (eyeTrackingDebug) {
            setFaceDetectionStats(prev => ({
              ...prev,
              facesDetected: detections.length
            }));
            
            // If we have faces detected, update stats
            if (detections.length > 0) {
              const detection = detections[0];
              setFaceDetected(true);
              
              // Calculate distance from face coords to target if available
              if (zombieEyesRef.current) {
                const targetRect = zombieEyesRef.current.getBoundingClientRect();
                const targetCenter = {
                  x: targetRect.left + targetRect.width / 2,
                  y: targetRect.top + targetRect.height / 2
                };
                
                // Simple distance calculation (this might need adjustment based on coordinate systems)
                const distance = Math.sqrt(
                  Math.pow(detection.faceCoords[0] - targetCenter.x, 2) + 
                  Math.pow(detection.faceCoords[1] - targetCenter.y, 2)
                );
                
                setEyeDistance(distance);
                setFaceDetectionStats(prev => ({
                  ...prev,
                  distance: Math.round(distance)
                }));
              }
            } else {
              setFaceDetected(false);
            }
          }
        }
      }, {
        debug: eyeTrackingDebug,
        videoSize: {
          width: 320,
          height: 240
        },
        threshold: eyeThreshold
      });
      
      if (!initialized) {
        console.warn('✗ Failed to initialize MediaPipe eye tracking');
        setCameraPermissionError('MediaPipe eye tracking initialization failed');
        setEyeTrackingInitializing(false);
      }
    } catch (error: any) {
      console.error('✗ Error setting up MediaPipe eye tracking:', error);
      setCameraPermissionError(error.message || 'Failed to set up MediaPipe eye tracking');
      setEyeTrackingInitializing(false);
      setCameraAccessGranted(false);
    }
  }, [handleEyeContact, eyeTrackingDebug, eyeThreshold]);

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

    // Don't trigger attacks in creative mode
    if (gameMode === 'creative') return;

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
  }, [gameState, gameMode, words]);

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
    
    // Apply different effects based on game mode
    if (gameMode === 'survival') {
      setPowerLevel(prev => Math.min(prev + attack.damage, 100));
    } else {
      setScore(prev => Math.max(prev - attack.damage, 0));
    }
    
    // Reset targeted word
    setTargetedWordIndex(null);
    setZombieAttacks(prev => prev.filter(a => a.timestamp !== attack.timestamp));
  }, [gameState, gameMode]);

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
    
    // Apply different effects based on game mode
    if (gameMode === 'survival') {
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
  }, [gameState, gameMode]);

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
      // Keep eye tracking active if camera is available
      if (!eyeTrackingActive && cameraAccessGranted) {
        setEyeTrackingActive(true);
      }
    }
  }, [gameState, eyeTrackingActive, cameraAccessGranted]);
  
  // Load saved threshold from localStorage on component mount
  useEffect(() => {
    const savedThreshold = localStorage.getItem('eyeTrackingThreshold');
    if (savedThreshold) {
      const thresholdValue = parseInt(savedThreshold);
      setEyeThreshold(thresholdValue);
    }
  }, []);

  // Update MediaPipe EyeTracker threshold when eyeThreshold state changes
  useEffect(() => {
    if (eyeTrackingActive) {
      MediaPipeEyeTracker.setThreshold(eyeThreshold);
    }
  }, [eyeThreshold, eyeTrackingActive]);

  // Reinitialize eye tracking when debug mode changes
  useEffect(() => {
    if (cameraAccessGranted) {
      // Only reinitialize if camera was already working
      console.log('Debug mode changed, reinitializing MediaPipe eye tracking...');
      MediaPipeEyeTracker.cleanup();
      setCameraAccessGranted(false);
      setupEyeTracking();
    }
  }, [eyeTrackingDebug, setupEyeTracking]);

  // Start eye tracking when camera access is granted (sliver is always visible)
  useEffect(() => {
    if (cameraAccessGranted && zombieEyesRef.current && showZombie) {
      // Add a small delay to ensure initialization is completely finished
      setTimeout(() => {
        if (zombieEyesRef.current) {
          console.log('Starting MediaPipe eye tracking with target element...');
          const success = MediaPipeEyeTracker.startTracking(zombieEyesRef.current);
          setEyeTrackingActive(success);
          if (success) {
            console.log('✓ MediaPipe eye tracking target set successfully');
          } else {
            console.error('✗ Failed to set MediaPipe eye tracking target');
          }
        }
      }, 100); // 100ms delay to ensure initialization is complete
    }
  }, [cameraAccessGranted, showZombie]);

  // Initialize eye tracking on component mount
  useEffect(() => {
    setupEyeTracking();
    
    return () => {
      // Clean up eye tracking on component unmount
      MediaPipeEyeTracker.cleanup();
      if (eyeContactIntervalRef.current) {
        clearInterval(eyeContactIntervalRef.current);
      }
    };
  }, [setupEyeTracking]);

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
              {silverChar.abilities.map((ability, index) => (
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
        <div>Player Level: {playerLevel}</div>
        <div>Experience: {playerExperience}/100</div>
        <div>Creatures Defeated: {creatureDefeatCount}</div>
        <div>Active Creatures: {activeCreatures.length}</div>
        {gameMode !== 'creative' && (
          <div>Mode: {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}</div>
        )}
      </div>
      
      <div className="word-container">
        {words.map((word, index) => (
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
      {activeCreatures.map(creatureSpawn => (
        <CreatureDisplay 
          key={creatureSpawn.spawnTime}
          creatureSpawn={creatureSpawn}
          onClick={() => handleCreatureClick(creatureSpawn.spawnTime)}
        />
      ))}
      
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
        <div>
          <label>Eye Tracking Threshold:</label>
          <input 
            type="range" 
            min="50" 
            max="150" 
            value={eyeThreshold} 
            onChange={e => setEyeThreshold(parseInt(e.target.value))} 
          />
          <span>{eyeThreshold}</span>
        </div>
      </div>
      
      {/* Camera Permission Status */}
      <div className="camera-status" style={{ 
        marginTop: '10px', 
        padding: '10px', 
        border: `2px solid ${cameraAccessGranted ? '#4CAF50' : '#f44336'}`,
        borderRadius: '8px',
        backgroundColor: cameraAccessGranted ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
      }}>
        <h4>Camera Status:</h4>
        {eyeTrackingInitializing ? (
          <div style={{ color: '#ff9800' }}>
            🔄 Initializing camera and face detection...
          </div>
        ) : cameraAccessGranted ? (
          <div style={{ color: '#4CAF50' }}>
            ✅ Camera access granted - Face detection active
            {eyeTrackingDebug && (
              <div style={{ marginTop: '5px', fontSize: '0.8rem' }}>
                Faces detected: {faceDetectionStats.facesDetected} | 
                Distance: {faceDetectionStats.distance}px | 
                Looking: {faceDetectionStats.isLooking ? '👁️' : '👀'}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ color: '#f44336', marginBottom: '10px' }}>
              ❌ Camera access required for face tracking
            </div>
            {cameraPermissionError && (
              <div style={{ color: '#f44336', fontSize: '0.8rem', marginBottom: '10px' }}>
                Error: {cameraPermissionError}
              </div>
            )}
            <button 
              onClick={setupEyeTracking}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📷 Enable Camera Access
            </button>
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666' }}>
              Click "Enable Camera Access" and allow camera permission when prompted by your browser.
            </div>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <h3>Calibration Guide:</h3>
        <ol style={{ paddingLeft: '20px', fontSize: '0.8rem' }}>
          <li>Make sure your face is well-lit</li>
          <li>Adjust the threshold slider based on your distance from the camera</li>
          <li>Try to stay at a consistent distance</li>
          <li>If detection is unstable, increase the threshold value</li>
        </ol>
      </div>
    </div>
  );
};

// Export the SilverGame component as default
export default SilverGame;
