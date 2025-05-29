import { useState, useCallback, useEffect, useRef } from 'react';
import { GameItem, ItemType, ITEM_DEFINITIONS } from '../types/gameItems';
import { CreatureSpawn } from '../types/creatures';

interface UseItemManagerProps {
  gameState: 'playing' | 'won' | 'lost' | 'round_over';
  containerRef: React.RefObject<HTMLDivElement>;
  activeCreatures: CreatureSpawn[];
  playerPosition: { x: number; y: number };
  onItemCollected: (item: GameItem) => void;
  onPlayerHit?: (damage: number) => void;
}

export const useItemManager = ({
  gameState,
  containerRef,
  activeCreatures,
  playerPosition,
  onItemCollected,
  onPlayerHit
}: UseItemManagerProps) => {
  const [items, setItems] = useState<GameItem[]>([]);
  const [showPlayer, setShowPlayer] = useState(true);
  const itemIdCounter = useRef(0);
  
  // Spawn an item
  const spawnItem = useCallback((type?: ItemType) => {
    if (!containerRef.current || gameState !== 'playing') return;
    
    const itemTypes: ItemType[] = ['coin', 'gold_bar', 'diamond', 'respawn_token', 'health_potion', 'power_crystal', 'word_scroll'];
    const selectedType = type || itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const definition = ITEM_DEFINITIONS[selectedType];
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newItem: GameItem = {
      id: `item_${itemIdCounter.current++}`,
      type: selectedType,
      position: {
        x: Math.random() * (containerRect.width - definition.size.width),
        y: Math.random() * (containerRect.height - definition.size.height)
      },
      value: definition.value,
      size: definition.size,
      collected: false,
      glitched: false,
      spawnTime: Date.now()
    };
    
    setItems(prev => [...prev, newItem]);
  }, [gameState, containerRef]);
  
  // Check Money Hater interactions
  const checkMoneyHaterInteractions = useCallback(() => {
    const moneyHaters = activeCreatures.filter(c => c.creature.type === 'money_hater');
    
    if (moneyHaters.length > 0) {
      console.log(`Checking ${moneyHaters.length} Money Haters for interactions`);
    }
    
    moneyHaters.forEach(hater => {
      if (hater.state === 'dying') return;
      
      setItems(prev => prev.map(item => {
        if (item.collected || !ITEM_DEFINITIONS[item.type].canBeConsumed) return item;
        
        // Check distance between Money Hater and item
        const haterCenterX = hater.position.x + hater.creature.appearance.size.width / 2;
        const haterCenterY = hater.position.y + hater.creature.appearance.size.height / 2;
        const itemCenterX = item.position.x + item.size.width / 2;
        const itemCenterY = item.position.y + item.size.height / 2;
        
        const dx = haterCenterX - itemCenterX;
        const dy = haterCenterY - itemCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Money Hater consumes items within range
        if (distance < 80) { // Increased range
          console.log(`Money Hater consuming ${item.type}! Distance: ${distance}`);
          // Add consumption animation class
          const itemElement = document.querySelector(`[data-item-id="${item.id}"]`);
          if (itemElement) {
            itemElement.classList.add('item-being-consumed');
          }
          return { ...item, collected: true };
        }
        
        return item;
      }));
    });
  }, [activeCreatures]);
  
  // Check Glitch interactions
  const checkGlitchInteractions = useCallback(() => {
    const glitches = activeCreatures.filter(c => c.creature.type === 'glitch');
    
    glitches.forEach(glitch => {
      if (glitch.state === 'dying') return;
      
      setItems(prev => prev.map(item => {
        if (item.collected || !ITEM_DEFINITIONS[item.type].canBeGlitched) return item;
        
        // Check distance between Glitch and item
        const dx = glitch.position.x + glitch.creature.appearance.size.width / 2 - (item.position.x + item.size.width / 2);
        const dy = glitch.position.y + glitch.creature.appearance.size.height / 2 - (item.position.y + item.size.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Glitch corrupts items within range
        if (distance < 50 && !item.glitched) {
          console.log(`Glitch corrupting ${item.type}!`);
          return { ...item, glitched: true };
        }
        
        return item;
      }));
    });
  }, [activeCreatures]);
  
  // Check Clanger interactions with player
  const checkClangerInteractions = useCallback(() => {
    if (!showPlayer) return;
    
    const clangers = activeCreatures.filter(c => c.creature.type === 'clanger');
    
    clangers.forEach(clanger => {
      if (clanger.state === 'dying' || clanger.state !== 'attacking') return;
      
      // Check distance between Clanger and player
      const dx = clanger.position.x + clanger.creature.appearance.size.width / 2 - (playerPosition.x + 30);
      const dy = clanger.position.y + clanger.creature.appearance.size.height / 2 - (playerPosition.y + 30);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Clanger smashes player within range
      if (distance < 80) {
        console.log('Clanger smashing player!');
        if (onPlayerHit) {
          onPlayerHit(35); // Cymbal Crash damage
        }
      }
    });
  }, [activeCreatures, playerPosition, showPlayer, onPlayerHit]);
  
  // Collect item
  const collectItem = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.collected) return;
    
    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, collected: true } : i
    ));
    
    // Remove item after animation
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== itemId));
    }, 500);
    
    onItemCollected(item);
  }, [items, onItemCollected]);
  
  // Auto-spawn items periodically
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Spawn some initial items
    if (items.length === 0) {
      spawnItem('coin');
      spawnItem('diamond');
      spawnItem('respawn_token');
      setTimeout(() => {
        spawnItem('gold_bar');
        spawnItem('coin');
      }, 500);
    }
    
    const spawnInterval = setInterval(() => {
      if (items.length < 10) { // Max 10 items at once
        spawnItem();
      }
    }, 3000); // Spawn every 3 seconds
    
    return () => clearInterval(spawnInterval);
  }, [gameState, items.length, spawnItem]);
  
  // Check creature interactions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interactionInterval = setInterval(() => {
      checkMoneyHaterInteractions();
      checkGlitchInteractions();
      checkClangerInteractions();
    }, 100); // Check every 100ms
    
    return () => clearInterval(interactionInterval);
  }, [gameState, checkMoneyHaterInteractions, checkGlitchInteractions, checkClangerInteractions]);
  
  // Clean up collected items
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setItems(prev => prev.filter(item => !item.collected || Date.now() - item.spawnTime < 600));
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  return {
    items,
    spawnItem,
    collectItem,
    showPlayer,
    setShowPlayer
  };
};