import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Creature, CreatureSpawn } from '../types/creatures';
import { ALL_CREATURES, getRandomCreature, getRandomCreatureByRarity } from '../data/creatures';
import { GameItem } from '../types/gameItems';

interface CreatureManagerProps {
  gameState: 'playing' | 'won' | 'lost' | 'round_over';
  gameMode: 'survival' | 'peaceful' | 'creative';
  words: Array<{ word: string; color: string; points: number }>;
  items: GameItem[];
  onCreatureAttack: (damage: number, creatureId: string) => void;
  onCreatureDefeat: (creature: Creature, experienceGained: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useCreatureManager = ({
  gameState,
  gameMode,
  words,
  items,
  onCreatureAttack,
  onCreatureDefeat,
  containerRef
}: CreatureManagerProps) => {
  const [activeCreatures, setActiveCreatures] = useState<CreatureSpawn[]>([]);
  const [spawnTimers, setSpawnTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const attackTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Creature spawn logic
  const spawnCreature = useCallback((creatureType?: string) => {
    if (!containerRef.current || gameState !== 'playing') return;

    let creature: Creature;
    
    if (creatureType) {
      creature = ALL_CREATURES.find(c => c.id === creatureType) || getRandomCreatureByRarity();
    } else {
      // Filter creatures based on game mode
      if (gameMode === 'peaceful') {
        creature = getRandomCreatureByRarity(c => 
          c.behavior.aggression === 'passive' || c.behavior.aggression === 'neutral'
        );
      } else {
        // Use rarity-based spawning for all modes
        creature = getRandomCreatureByRarity();
      }
    }

    // Check if we've reached max count for this creature type
    const existingCount = activeCreatures.filter(spawn => spawn.creature.id === creature.id).length;
    if (existingCount >= creature.behavior.maxCount) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const position = {
      x: Math.random() * (containerRect.width - creature.appearance.size.width),
      y: Math.random() * (containerRect.height - creature.appearance.size.height)
    };

    const newSpawn: CreatureSpawn = {
      creature,
      position,
      health: creature.stats.health,
      state: 'spawning',
      lastAttack: Date.now(),
      spawnTime: Date.now()
    };

    setActiveCreatures(prev => [...prev, newSpawn]);

    // Set spawn state to idle after animation
    setTimeout(() => {
      setActiveCreatures(prev => 
        prev.map(spawn => 
          spawn.spawnTime === newSpawn.spawnTime 
            ? { ...spawn, state: 'idle' }
            : spawn
        )
      );
    }, 1000);

  }, [gameState, gameMode, activeCreatures, containerRef]);

  // Creature attack logic
  const handleCreatureAttack = useCallback((creatureSpawn: CreatureSpawn) => {
    if (gameState !== 'playing' || creatureSpawn.state === 'dying') return;

    const { creature } = creatureSpawn;
    const now = Date.now();
    
    // Check attack cooldown
    const attackCooldown = 2000 + (creature.stats.intelligence * 500); // Smarter creatures attack more strategically
    if (now - creatureSpawn.lastAttack < attackCooldown) return;

    // Passive creatures don't attack
    if (creature.behavior.aggression === 'passive') return;

    // Select ability
    const availableAbilities = creature.abilities.filter(ability => 
      !ability.cost || ability.cost <= 20 // Simple energy system
    );
    const ability = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];

    let damage = ability.damage || creature.stats.attack;
    
    // Apply game mode modifiers
    if (gameMode === 'peaceful') {
      damage = Math.ceil(damage * 0.5);
    } else if (gameMode === 'creative') {
      damage = 0; // No damage in creative mode
    }

    // Update creature state
    setActiveCreatures(prev =>
      prev.map(spawn =>
        spawn.spawnTime === creatureSpawn.spawnTime
          ? { ...spawn, state: 'attacking', lastAttack: now }
          : spawn
      )
    );

    // Apply attack after animation delay
    const attackTimeout = setTimeout(() => {
      onCreatureAttack(damage, creature.id);
      
      // Return to idle state
      setActiveCreatures(prev =>
        prev.map(spawn =>
          spawn.spawnTime === creatureSpawn.spawnTime
            ? { ...spawn, state: 'idle' }
            : spawn
        )
      );
    }, 800);

    attackTimeouts.current.set(`${creatureSpawn.spawnTime}`, attackTimeout);

  }, [gameState, gameMode, onCreatureAttack]);

  // Creature movement logic
  const updateCreaturePositions = useCallback(() => {
    if (!containerRef.current) return;

    setActiveCreatures(prev => prev.map(spawn => {
      if (spawn.state === 'dying' || spawn.state === 'spawning') return spawn;

      const { creature, position } = spawn;
      const containerRect = containerRef.current!.getBoundingClientRect();
      
      let newPosition = { ...position };

      switch (creature.behavior.movementPattern) {
        case 'random':
          newPosition.x += (Math.random() - 0.5) * creature.stats.speed;
          newPosition.y += (Math.random() - 0.5) * creature.stats.speed;
          break;
        
        case 'patrol':
          // Simple back and forth movement
          const time = Date.now() * 0.001;
          newPosition.x = Math.abs(Math.sin(time + spawn.spawnTime * 0.001)) * (containerRect.width - creature.appearance.size.width);
          break;
        
        case 'hunt':
          // Money Haters hunt for valuable items
          if (creature.type === 'money_hater') {
            // Find nearest valuable item
            const valuableItems = items.filter(item => 
              item.type === 'coin' || 
              item.type === 'diamond' || 
              item.type === 'gold_bar' || 
              item.type === 'respawn_token'
            );
            
            if (valuableItems.length > 0) {
              // Find the nearest item
              let nearestItem = valuableItems[0];
              let minDistance = Infinity;
              
              valuableItems.forEach(item => {
                const dx = item.position.x - position.x;
                const dy = item.position.y - position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance) {
                  minDistance = distance;
                  nearestItem = item;
                }
              });
              
              // Move towards the nearest item
              const dx = nearestItem.position.x - position.x;
              const dy = nearestItem.position.y - position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0) {
                newPosition.x += (dx / distance) * creature.stats.speed * 0.8;
                newPosition.y += (dy / distance) * creature.stats.speed * 0.8;
              }
            } else {
              // No valuable items, move randomly
              newPosition.x += (Math.random() - 0.5) * creature.stats.speed;
              newPosition.y += (Math.random() - 0.5) * creature.stats.speed;
            }
          } else {
            // Other creatures move towards center
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            const dx = centerX - position.x;
            const dy = centerY - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              newPosition.x += (dx / distance) * creature.stats.speed * 0.5;
              newPosition.y += (dy / distance) * creature.stats.speed * 0.5;
            }
          }
          break;
        
        case 'guard':
          // Stay relatively stationary
          break;
        
        case 'swarm':
          // Move towards other creatures of same type
          const sameType = prev.filter(other => 
            other.creature.type === creature.type && other.spawnTime !== spawn.spawnTime
          );
          if (sameType.length > 0) {
            const avgX = sameType.reduce((sum, other) => sum + other.position.x, 0) / sameType.length;
            const avgY = sameType.reduce((sum, other) => sum + other.position.y, 0) / sameType.length;
            const dx = avgX - position.x;
            const dy = avgY - position.y;
            newPosition.x += dx * 0.02;
            newPosition.y += dy * 0.02;
          }
          break;
      }

      // Keep within bounds
      newPosition.x = Math.max(0, Math.min(newPosition.x, containerRect.width - creature.appearance.size.width));
      newPosition.y = Math.max(0, Math.min(newPosition.y, containerRect.height - creature.appearance.size.height));

      return { ...spawn, position: newPosition };
    }));
  }, [containerRef, items]);

  // Defeat creature
  const defeatCreature = useCallback((spawnTime: number) => {
    const creature = activeCreatures.find(spawn => spawn.spawnTime === spawnTime);
    if (!creature) return;

    // Update state to dying
    setActiveCreatures(prev =>
      prev.map(spawn =>
        spawn.spawnTime === spawnTime
          ? { ...spawn, state: 'dying' }
          : spawn
      )
    );

    // Remove after death animation
    setTimeout(() => {
      setActiveCreatures(prev => prev.filter(spawn => spawn.spawnTime !== spawnTime));
      onCreatureDefeat(creature.creature, creature.creature.experienceReward);
      
      // Clear any pending attack timeouts
      const timeout = attackTimeouts.current.get(`${spawnTime}`);
      if (timeout) {
        clearTimeout(timeout);
        attackTimeouts.current.delete(`${spawnTime}`);
      }
    }, 1500);
  }, [activeCreatures, onCreatureDefeat]);

  // Setup spawn timers
  useEffect(() => {
    if (gameState !== 'playing') {
      // Clear all timers when not playing
      spawnTimers.forEach(timer => clearTimeout(timer));
      setSpawnTimers(new Map());
      return;
    }

    // Don't spawn creatures in creative mode
    if (gameMode === 'creative') return;

    const uniqueCreatures = Array.from(new Set(ALL_CREATURES.map(c => c.id)));
    const newTimers = new Map<string, NodeJS.Timeout>();

    uniqueCreatures.forEach(creatureId => {
      const creature = ALL_CREATURES.find(c => c.id === creatureId)!;
      const spawnRate = gameMode === 'peaceful' 
        ? creature.behavior.spawnRate * 2 // Slower spawns in peaceful mode
        : creature.behavior.spawnRate;

      const timer = setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance to spawn this creature type
          spawnCreature(creatureId);
        }
      }, spawnRate * 1000);

      newTimers.set(creatureId, timer);
    });

    setSpawnTimers(newTimers);

    return () => {
      newTimers.forEach(timer => clearTimeout(timer));
    };
  }, [gameState, gameMode, spawnCreature]);

  // Movement update loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const movementInterval = setInterval(updateCreaturePositions, 100);
    return () => clearInterval(movementInterval);
  }, [gameState, updateCreaturePositions]);

  // Attack loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const attackInterval = setInterval(() => {
      activeCreatures.forEach(spawn => {
        if (spawn.state === 'idle' && spawn.creature.behavior.aggression !== 'passive') {
          handleCreatureAttack(spawn);
        }
      });
    }, 1000);

    return () => clearInterval(attackInterval);
  }, [gameState, activeCreatures, handleCreatureAttack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      spawnTimers.forEach(timer => clearTimeout(timer));
      attackTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [spawnTimers]);

  return {
    activeCreatures,
    spawnCreature,
    defeatCreature
  };
};
