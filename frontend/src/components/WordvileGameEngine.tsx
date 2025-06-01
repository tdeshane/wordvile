import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SILVER_CHALLENGE_CREATURES } from '../data/creatures';
import { WORDVILE_LEGENDS } from '../data/wordvileLegends';
import { ITEM_DEFINITIONS, ItemType } from '../types/gameItems';
import { Creature } from '../types/creatures';
import '../styles/WordvileGameEngine.css';

interface CreatureInstance {
  id: string;
  type: string;
  name: string;
  emoji: string;
  className: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  behavior: string;
  speed: number;
  health: number;
  maxHealth: number;
}

// Simple creature data for game engine
interface SimpleCreature {
  type: string;
  name: string;
  emoji: string;
  className: string;
  behavior: string;
  speed: number;
  health: number;
}

interface ItemInstance {
  id: string;
  type: string;
  emoji: string;
  x: number;
  y: number;
  value: number;
}

const WordvileGameEngine: React.FC = () => {
  const [creatures, setCreatures] = useState<CreatureInstance[]>([]);
  const [items, setItems] = useState<ItemInstance[]>([]);
  const [score, setScore] = useState(0);
  const [itemsCollected, setItemsCollected] = useState(0);
  const [creaturesSpawned, setCreaturesSpawned] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCreatureType, setSelectedCreatureType] = useState<string>('');
  const [showMessage, setShowMessage] = useState<{ text: string; duration: number } | null>(null);
  const [debugMode, setDebugMode] = useState(false); // Debug mode for auto-spawning
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  // Map creature emojis
  const CREATURE_EMOJIS: Record<string, string> = {
    money_hater: '💸',
    clanger: '🔔',
    glitch: '👾',
    the_great_lexicon: '📖',
    silver_hero: '⚔️',
    synonym_dragon: '🐉',
    mind_poisoner: '🧠',
    spelling_sprite: '✨',
    word_zombie: '🧟',
    // Default emoji for others
    default: '👾'
  };
  
  // Convert Creature to SimpleCreature
  const convertToSimpleCreature = (creature: Creature): SimpleCreature => ({
    type: creature.type,
    name: creature.name,
    emoji: CREATURE_EMOJIS[creature.type] || CREATURE_EMOJIS.default,
    className: `creature-${creature.category || 'default'}`,
    behavior: typeof creature.behavior === 'string' ? creature.behavior : (creature.behavior?.movementPattern || 'wander'),
    speed: creature.stats?.speed || 2,
    health: creature.stats?.health || 100
  });
  
  // Create simple creatures from full creatures
  const SIMPLE_CREATURES: Record<string, SimpleCreature> = {
    ...(SILVER_CHALLENGE_CREATURES || []).reduce<Record<string, SimpleCreature>>((acc, creature) => ({
      ...acc,
      [creature.type]: convertToSimpleCreature(creature)
    }), {}),
    ...(WORDVILE_LEGENDS || []).reduce<Record<string, SimpleCreature>>((acc, creature) => ({
      ...acc,
      [creature.type]: convertToSimpleCreature(creature)
    }), {})
  };
  
  // Get all available creatures
  const allCreatures: SimpleCreature[] = Object.values(SIMPLE_CREATURES) || [];
  
  // Display message
  const displayMessage = useCallback((text: string, duration: number = 3000) => {
    setShowMessage({ text, duration });
    setTimeout(() => setShowMessage(null), duration);
  }, []);

  // Spawn creature
  const spawnCreature = useCallback((type: string, x?: number, y?: number) => {
    const creatureData = SIMPLE_CREATURES[type];
    if (!creatureData || !gameContainerRef.current) return;

    const containerRect = gameContainerRef.current.getBoundingClientRect();
    
    const creature: CreatureInstance = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      name: creatureData.name,
      emoji: creatureData.emoji || '👾',
      className: creatureData.className || 'default-creature',
      x: x ?? Math.random() * (containerRect.width - 100),
      y: y ?? Math.random() * (containerRect.height - 100),
      vx: (Math.random() - 0.5) * (creatureData.speed || 2),
      vy: (Math.random() - 0.5) * (creatureData.speed || 2),
      behavior: creatureData.behavior || 'wander',
      speed: creatureData.speed || 2,
      health: creatureData.health || 100,
      maxHealth: creatureData.health || 100
    };

    setCreatures(prev => [...prev, creature]);
    setCreaturesSpawned(prev => prev + 1);

    // Special effects for legendary creatures
    if (type === 'the_great_lexicon') {
      displayMessage('THE GREAT LEXICON HAS ARRIVED!', 5000);
      document.body.style.animation = 'screenShake 0.5s';
    }
  }, [displayMessage]);

  // Spawn random creature
  const spawnRandomCreature = useCallback(() => {
    const types = Object.keys(SIMPLE_CREATURES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    spawnCreature(randomType);
  }, [spawnCreature, SIMPLE_CREATURES]);

  // Spawn legendary creature
  const spawnLegendary = useCallback(() => {
    const legendaries = ['the_great_lexicon', 'silver_hero', 'synonym_dragon', 'mind_poisoner'];
    const randomLegendary = legendaries[Math.floor(Math.random() * legendaries.length)];
    spawnCreature(randomLegendary);
  }, [spawnCreature]);

  // Spawn item
  const spawnItem = useCallback((type?: ItemType) => {
    if (!gameContainerRef.current) return;
    
    const containerRect = gameContainerRef.current.getBoundingClientRect();
    const itemTypes = Object.keys(ITEM_DEFINITIONS) as ItemType[];
    const itemType = type || itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const itemDef = ITEM_DEFINITIONS[itemType];
    
    const item: ItemInstance = {
      id: `${itemType}-${Date.now()}-${Math.random()}`,
      type: itemType,
      emoji: itemDef.symbol,
      x: Math.random() * (containerRect.width - 50),
      y: Math.random() * (containerRect.height - 50),
      value: itemDef.value
    };

    setItems(prev => [...prev, item]);
  }, []);

  // Handle creature click
  const handleCreatureClick = useCallback((creatureId: string) => {
    const creature = creatures.find(c => c.id === creatureId);
    if (!creature) return;

    displayMessage(`${creature.name} says hello!`, 2000);
    
    // Special interactions
    if (creature.type === 'the_great_lexicon') {
      setScore(prev => prev + 1000);
      displayMessage('You have been blessed by THE GREAT LEXICON! +1000 points!', 3000);
    } else {
      setScore(prev => prev + 10);
    }
  }, [creatures, displayMessage]);

  // Handle item collection
  const handleItemClick = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setItems(prev => prev.filter(i => i.id !== itemId));
    setItemsCollected(prev => prev + 1);
    setScore(prev => prev + item.value);
    displayMessage(`+${item.value} points!`, 1000);
  }, [items, displayMessage]);

  // Update creature positions
  const updateCreatures = useCallback(() => {
    if (!gameContainerRef.current) return;
    
    const containerRect = gameContainerRef.current.getBoundingClientRect();
    
    setCreatures(prev => prev.map(creature => {
      let { x, y, vx, vy } = creature;
      
      // Update position based on behavior
      if (creature.behavior === 'hunts_items' && items.length > 0) {
        // Find nearest item
        let nearestItem: ItemInstance | null = null;
        let minDist = Infinity;
        
        for (const item of items) {
          const dist = Math.hypot(item.x - x, item.y - y);
          if (dist < minDist) {
            minDist = dist;
            nearestItem = item;
          }
        }
        
        if (nearestItem) {
          const dx = nearestItem.x - x;
          const dy = nearestItem.y - y;
          const dist = Math.hypot(dx, dy);
          vx = (dx / dist) * creature.speed;
          vy = (dy / dist) * creature.speed;
        }
      }
      
      // Update position
      x += vx;
      y += vy;
      
      // Bounce off walls
      if (x <= 0 || x >= containerRect.width - 60) {
        vx = -vx;
        x = Math.max(0, Math.min(x, containerRect.width - 60));
      }
      if (y <= 0 || y >= containerRect.height - 60) {
        vy = -vy;
        y = Math.max(0, Math.min(y, containerRect.height - 60));
      }
      
      return { ...creature, x, y, vx, vy };
    }));
  }, [items]);

  // Check collisions
  const checkCollisions = useCallback(() => {
    // Check creature-item collisions
    creatures.forEach(creature => {
      if (creature.behavior === 'hunts_items') {
        items.forEach(item => {
          const dist = Math.hypot(item.x - creature.x, item.y - creature.y);
          if (dist < 50) {
            handleItemClick(item.id);
          }
        });
      }
    });
  }, [creatures, items, handleItemClick]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isPaused) {
      updateCreatures();
      checkCollisions();
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isPaused, updateCreatures, checkCollisions]);

  // Clear all entities
  const clearAll = useCallback(() => {
    setCreatures([]);
    setItems([]);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case ' ':
          e.preventDefault();
          spawnRandomCreature();
          break;
        case 'i':
          spawnItem();
          break;
        case 'l':
          spawnLegendary();
          break;
        case 'g':
          spawnCreature('the_great_lexicon', 
            gameContainerRef.current?.clientWidth ? gameContainerRef.current.clientWidth / 2 : undefined,
            gameContainerRef.current?.clientHeight ? gameContainerRef.current.clientHeight / 2 : undefined
          );
          break;
        case 'c':
          clearAll();
          break;
        case 'p':
          setIsPaused(prev => !prev);
          displayMessage(isPaused ? 'RESUMED' : 'PAUSED', 1000);
          break;
        case 'd':
          setDebugMode(prev => !prev);
          displayMessage(debugMode ? 'Debug Mode OFF' : 'Debug Mode ON - Auto-spawning enabled!', 2000);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [spawnRandomCreature, spawnItem, spawnLegendary, spawnCreature, clearAll, isPaused, debugMode, displayMessage]);

  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // Auto-spawn items
  useEffect(() => {
    const interval = setInterval(() => {
      if (items.length < 10 && !isPaused) {
        spawnItem();
      }
    }, debugMode ? 1000 : 3000); // Faster in debug mode

    return () => clearInterval(interval);
  }, [items.length, isPaused, spawnItem, debugMode]);

  // Debug mode auto-spawning
  useEffect(() => {
    if (!debugMode || isPaused) return;

    // Spawn random creatures frequently
    const creatureInterval = setInterval(() => {
      if (creatures.length < 20) { // Allow more creatures in debug mode
        spawnRandomCreature();
      }
    }, 2000); // Every 2 seconds

    // Spawn legendary creatures occasionally
    const legendaryInterval = setInterval(() => {
      if (creatures.length < 20) {
        spawnLegendary();
      }
    }, 8000); // Every 8 seconds

    // Spawn Great Lexicon rarely
    const greatLexiconInterval = setInterval(() => {
      if (creatures.length < 20) {
        const hasGreatLexicon = creatures.some(c => c.type === 'the_great_lexicon');
        if (!hasGreatLexicon) {
          spawnCreature('the_great_lexicon', 
            gameContainerRef.current?.clientWidth ? gameContainerRef.current.clientWidth / 2 : undefined,
            gameContainerRef.current?.clientHeight ? gameContainerRef.current.clientHeight / 2 : undefined
          );
        }
      }
    }, 15000); // Every 15 seconds

    // Spawn more items in debug mode
    const itemInterval = setInterval(() => {
      if (items.length < 20) { // Allow more items
        spawnItem();
      }
    }, 1500); // Every 1.5 seconds

    return () => {
      clearInterval(creatureInterval);
      clearInterval(legendaryInterval);
      clearInterval(greatLexiconInterval);
      clearInterval(itemInterval);
    };
  }, [debugMode, isPaused, creatures, items.length, spawnRandomCreature, spawnLegendary, spawnCreature, spawnItem]);

  return (
    <div className="wordvile-game-engine" ref={gameContainerRef}>
      {/* Game Stats */}
      <div className="game-stats">
        <h3>Game Stats</h3>
        <div>Score: {score}</div>
        <div>Items Collected: {itemsCollected}</div>
        <div>Creatures Spawned: {creaturesSpawned}</div>
        <div>Active Creatures: {creatures.length}</div>
      </div>

      {/* Creature List */}
      <div className="creature-list">
        <h3>Active Creatures</h3>
        <div className="creature-entries">
          {creatures.map(creature => (
            <div 
              key={creature.id} 
              className="creature-entry"
              onClick={() => {
                const element = document.getElementById(creature.id);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              {creature.emoji} {creature.name}
            </div>
          ))}
        </div>
      </div>

      {/* Spawn Controls */}
      <div className="spawn-controls">
        <button 
          onClick={() => {
            setDebugMode(!debugMode);
            displayMessage(debugMode ? 'Debug Mode OFF' : 'Debug Mode ON - Auto-spawning enabled!', 2000);
          }}
          style={{
            backgroundColor: debugMode ? '#ff6b6b' : '#51cf66',
            fontWeight: 'bold',
            border: `3px solid ${debugMode ? '#ff4757' : '#2ed573'}`
          }}
        >
          {debugMode ? '🐛 Debug ON' : '🐛 Debug OFF'}
        </button>
        {!debugMode && (
          <>
            <button onClick={spawnRandomCreature}>Spawn Random (Space)</button>
            <button onClick={spawnLegendary}>Spawn Legendary (L)</button>
            <button onClick={() => spawnCreature('the_great_lexicon')}>Summon Great Lexicon (G)</button>
            <button onClick={() => spawnItem()}>Spawn Item (I)</button>
          </>
        )}
        <button onClick={clearAll}>Clear All (C)</button>
        <button onClick={() => {
          setIsPaused(!isPaused);
          displayMessage(isPaused ? 'RESUMED' : 'PAUSED', 1000);
        }}>
          {isPaused ? 'Resume (P)' : 'Pause (P)'}
        </button>
      </div>

      {/* Creature Selector */}
      {!debugMode && (
        <div className="creature-selector">
          <select 
            value={selectedCreatureType} 
            onChange={(e) => setSelectedCreatureType(e.target.value)}
          >
            <option value="">Select a creature to spawn...</option>
            {allCreatures.length > 0 && allCreatures.map(creature => (
              <option key={creature.type} value={creature.type}>
                {creature.emoji} {creature.name}
              </option>
            ))}
          </select>
          <button 
            onClick={() => selectedCreatureType && spawnCreature(selectedCreatureType)}
            disabled={!selectedCreatureType}
          >
            Spawn Selected
          </button>
        </div>
      )}

      {/* Creatures */}
      {creatures.map(creature => (
        <div 
          key={creature.id}
          id={creature.id}
          className={`creature ${creature.className}`}
          style={{
            left: `${creature.x}px`,
            top: `${creature.y}px`
          }}
          onClick={() => handleCreatureClick(creature.id)}
        >
          <div className="creature-body">
            {creature.emoji}
          </div>
          {/* Health bar */}
          <div className="creature-health-bar">
            <div 
              className="health-fill"
              style={{ width: `${(creature.health / creature.maxHealth) * 100}%` }}
            />
          </div>
        </div>
      ))}

      {/* Items */}
      {items.map(item => (
        <div 
          key={item.id}
          className="game-item"
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`
          }}
          onClick={() => handleItemClick(item.id)}
        >
          {item.emoji}
        </div>
      ))}

      {/* Message Display */}
      {showMessage && (
        <div className="message-display">
          {showMessage.text}
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h4>Controls:</h4>
        <ul>
          <li>D - Toggle Debug Mode (Auto-spawn)</li>
          {!debugMode && (
            <>
              <li>Space - Spawn Random Creature</li>
              <li>L - Spawn Legendary</li>
              <li>G - Summon Great Lexicon</li>
              <li>I - Spawn Item</li>
            </>
          )}
          <li>C - Clear All</li>
          <li>P - Pause/Resume</li>
        </ul>
        {debugMode && (
          <div style={{ marginTop: '10px', color: '#ff6b6b', fontWeight: 'bold' }}>
            🐛 DEBUG MODE ACTIVE - Auto-spawning enabled!
          </div>
        )}
      </div>
    </div>
  );
};

export default WordvileGameEngine;