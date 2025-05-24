import React from 'react';
import { CreatureSpawn } from '../types/creatures';

interface CreatureDisplayProps {
  creatureSpawn: CreatureSpawn;
  onClick?: () => void;
}

export const CreatureDisplay: React.FC<CreatureDisplayProps> = ({ creatureSpawn, onClick }) => {
  const { creature, position, state, health } = creatureSpawn;
  const { appearance, stats } = creature;

  const getAnimationClass = () => {
    switch (appearance.animationType) {
      case 'float': return 'creature-float';
      case 'walk': return 'creature-walk';
      case 'fly': return 'creature-fly';
      case 'slither': return 'creature-slither';
      case 'teleport': return 'creature-teleport';
      default: return 'creature-idle';
    }
  };

  const getStateClass = () => {
    switch (state) {
      case 'spawning': return 'creature-spawning';
      case 'attacking': return 'creature-attacking';
      case 'dying': return 'creature-dying';
      case 'moving': return 'creature-moving';
      default: return 'creature-idle';
    }
  };

  return (
    <div
      className={`creature-container ${getAnimationClass()} ${getStateClass()} creature-${creature.category} creature-${creature.type.replace('_', '-')}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${appearance.size.width}px`,
        height: `${appearance.size.height}px`,
        zIndex: 10
      }}
      onClick={onClick}
      title={`${creature.name} - ${creature.description}`}
    >
      {/* Creature Body */}
      <div
        className="creature-body"
        style={{
          backgroundColor: appearance.primaryColor,
          border: `2px solid ${appearance.secondaryColor || appearance.primaryColor}`,
          filter: appearance.glowEffect ? `drop-shadow(0 0 10px ${appearance.primaryColor})` : 'none'
        }}
      >
        {/* Creature Face/Eyes based on type */}
        {(creature.type.includes('zombie') || creature.type.includes('skeleton')) && (
          <div className="creature-face undead-face">
            <div className="creature-eye left" style={{ backgroundColor: '#ff0000' }}></div>
            <div className="creature-eye right" style={{ backgroundColor: '#ff0000' }}></div>
            <div className="creature-mouth"></div>
          </div>
        )}
        
        {creature.category === 'humanoid' && (
          <div className="creature-face humanoid-face">
            <div className="creature-eye left" style={{ backgroundColor: '#4682b4' }}></div>
            <div className="creature-eye right" style={{ backgroundColor: '#4682b4' }}></div>
            <div className="creature-mouth friendly"></div>
          </div>
        )}
        
        {creature.category === 'dragon' && (
          <div className="creature-face dragon-face">
            <div className="creature-eye left dragon-eye" style={{ backgroundColor: '#ffd700' }}></div>
            <div className="creature-eye right dragon-eye" style={{ backgroundColor: '#ffd700' }}></div>
            <div className="dragon-nostril left"></div>
            <div className="dragon-nostril right"></div>
          </div>
        )}
        
        {creature.category === 'fey' && (
          <div className="creature-face fey-face">
            <div className="creature-eye left fey-eye" style={{ backgroundColor: '#ff69b4' }}></div>
            <div className="creature-eye right fey-eye" style={{ backgroundColor: '#ff69b4' }}></div>
            <div className="fey-sparkles"></div>
          </div>
        )}
        
        {creature.category === 'beast' && (
          <div className="creature-face beast-face">
            <div className="creature-eye left beast-eye" style={{ backgroundColor: '#ffff00' }}></div>
            <div className="creature-eye right beast-eye" style={{ backgroundColor: '#ffff00' }}></div>
            <div className="beast-snout"></div>
          </div>
        )}
      </div>

      {/* Aura Effect */}
      {appearance.aura && (
        <div 
          className={`creature-aura aura-${appearance.aura.replace(/\s+/g, '-')}`}
          style={{
            position: 'absolute',
            top: '-10px',
            left: '-10px',
            right: '-10px',
            bottom: '-10px',
            borderRadius: '50%',
            opacity: 0.3,
            pointerEvents: 'none'
          }}
        ></div>
      )}

      {/* Health Bar */}
      <div className="creature-health-bar">
        <div 
          className="health-fill"
          style={{
            width: `${(health / stats.maxHealth) * 100}%`,
            backgroundColor: health > stats.maxHealth * 0.6 ? '#00ff00' : 
                           health > stats.maxHealth * 0.3 ? '#ffff00' : '#ff0000'
          }}
        ></div>
      </div>

      {/* Name Label */}
      <div className="creature-name-label">
        {creature.name}
      </div>

      {/* Special Effects */}
      {state === 'attacking' && (
        <div className="attack-effect">
          <div className="attack-circle"></div>
        </div>
      )}

      {state === 'spawning' && (
        <div className="spawn-effect">
          <div className="spawn-particles"></div>
        </div>
      )}

      {/* Rarity Indicator */}
      <div className={`rarity-indicator rarity-${creature.rarity}`}>
        {creature.rarity === 'legendary' && '★★★'}
        {creature.rarity === 'epic' && '★★'}
        {creature.rarity === 'rare' && '★'}
      </div>
    </div>
  );
};
