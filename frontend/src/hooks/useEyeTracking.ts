import { useEffect, useRef, useCallback } from 'react'
import { useEyeTrackingStore } from '@store/useEyeTrackingStore'
import eyeTrackingService from '@services/EyeTrackingService'
import logger from '@utils/logger'

interface UseEyeTrackingOptions {
  onEyesLost?: () => void
  onEyesFound?: () => void
  autoStart?: boolean
  targetElement?: HTMLElement | null
}

export const useEyeTracking = (options: UseEyeTrackingOptions = {}) => {
  const {
    onEyesLost,
    onEyesFound,
    autoStart = true,
    targetElement
  } = options
  
  const isTracking = useEyeTrackingStore(state => state.isTracking)
  const isEyesOnScreen = useEyeTrackingStore(state => state.isEyesOnScreen)
  const eyePosition = useEyeTrackingStore(state => state.lastEyePosition)
  const isGreatLexiconActive = useEyeTrackingStore(state => state.isGreatLexiconActive)
  
  const prevEyesOnScreen = useRef(isEyesOnScreen)
  
  // Handle eyes lost/found callbacks
  useEffect(() => {
    if (prevEyesOnScreen.current && !isEyesOnScreen) {
      onEyesLost?.()
    } else if (!prevEyesOnScreen.current && isEyesOnScreen) {
      onEyesFound?.()
    }
    
    prevEyesOnScreen.current = isEyesOnScreen
  }, [isEyesOnScreen, onEyesLost, onEyesFound])
  
  // Auto-start tracking if requested
  useEffect(() => {
    if (autoStart && !isTracking) {
      const startTracking = async () => {
        try {
          await eyeTrackingService.initialize()
          
          if (targetElement) {
            eyeTrackingService.startTracking(targetElement)
          } else {
            eyeTrackingService.startTracking()
          }
        } catch (error) {
          logger.error('Failed to start eye tracking', error)
        }
      }
      
      startTracking()
    }
    
    return () => {
      if (autoStart) {
        eyeTrackingService.stopTracking()
      }
    }
  }, [autoStart, targetElement])
  
  const startTracking = useCallback(async () => {
    try {
      if (!isTracking) {
        await eyeTrackingService.initialize()
      }
      eyeTrackingService.startTracking(targetElement || undefined)
    } catch (error) {
      logger.error('Failed to start eye tracking', error)
    }
  }, [targetElement, isTracking])
  
  const stopTracking = useCallback(() => {
    eyeTrackingService.stopTracking()
  }, [])
  
  const recalibrate = useCallback(async () => {
    await eyeTrackingService.startCalibration()
  }, [])
  
  const setSensitivity = useCallback((sensitivity: number) => {
    eyeTrackingService.setSensitivity(sensitivity)
  }, [])
  
  return {
    // State
    isTracking,
    isEyesOnScreen,
    eyePosition,
    isGreatLexiconActive,
    
    // Actions
    startTracking,
    stopTracking,
    recalibrate,
    setSensitivity
  }
}

export default useEyeTracking