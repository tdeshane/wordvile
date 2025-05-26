import React, { useEffect, useState } from 'react'
import { useEyeTrackingStore } from '@store/useEyeTrackingStore'
import '@styles/GreatLexicon.css'

export const GreatLexicon: React.FC = () => {
  const isActive = useEyeTrackingStore(state => state.isGreatLexiconActive)
  const [glitchText, setGlitchText] = useState('')
  const [warningLevel, setWarningLevel] = useState(0)
  
  useEffect(() => {
    if (!isActive) {
      setWarningLevel(0)
      return
    }
    
    // Escalating warnings
    const warningInterval = setInterval(() => {
      setWarningLevel(prev => Math.min(prev + 1, 5))
    }, 2000)
    
    // Glitch text effect
    const glitchInterval = setInterval(() => {
      const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?~'
      const messages = [
        'OBSERVER ABSENT',
        'REALITY UNSTABLE',
        'VOID CORRUPTION IMMINENT',
        'MULTIVERSE AT RISK',
        'RETURN YOUR GAZE',
        'THE GREAT LEXICON SEES ALL'
      ]
      
      const message = messages[Math.floor(Math.random() * messages.length)]
      let glitched = ''
      
      for (let i = 0; i < message.length; i++) {
        if (Math.random() > 0.7) {
          glitched += chars[Math.floor(Math.random() * chars.length)]
        } else {
          glitched += message[i]
        }
      }
      
      setGlitchText(glitched)
    }, 100)
    
    return () => {
      clearInterval(warningInterval)
      clearInterval(glitchInterval)
    }
  }, [isActive])
  
  if (!isActive) return null
  
  return (
    <div className="great-lexicon-overlay">
      <div className="void-effect" />
      
      <div className="lexicon-content">
        <div className="lexicon-symbol">
          <img 
            src="/the_GREAT_LEXICON.png" 
            alt="THE GREAT LEXICON" 
            className="great-lexicon-image"
          />
        </div>
        
        <h1 className="lexicon-title glitch" data-text="THE GREAT LEXICON">
          THE GREAT LEXICON
        </h1>
        
        <div className="warning-text">
          <p className={`warning-level-${warningLevel}`}>
            {glitchText}
          </p>
        </div>
        
        <div className="corruption-meter">
          <div className="corruption-label">VOID CORRUPTION</div>
          <div className="corruption-bar">
            <div 
              className="corruption-fill"
              style={{ width: `${warningLevel * 20}%` }}
            />
          </div>
          <div className="corruption-percentage">
            {warningLevel * 20}%
          </div>
        </div>
        
        {warningLevel >= 3 && (
          <div className="critical-warning">
            <p>⚠️ CRITICAL: Return your gaze immediately ⚠️</p>
            <p>The multiverse depends on your observation</p>
          </div>
        )}
        
        <div className="lexicon-messages">
          <p className="fade-in-1">I AM MORE THAN SILVER</p>
          <p className="fade-in-2">I AM MORE THAN MENCHUBA</p>
          <p className="fade-in-3">I AM THE WORD BEYOND WORDS</p>
          <p className="fade-in-4">YOUR ABSENCE WEAKENS REALITY</p>
        </div>
      </div>
      
      <div className="static-noise" />
    </div>
  )
}

export default GreatLexicon