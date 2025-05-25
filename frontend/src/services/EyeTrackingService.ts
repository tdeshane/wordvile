import mediaEyeTracker from '@utils/MediaPipeEyeTracker'
import { useEyeTrackingStore } from '@store/useEyeTrackingStore'
import logger from '@utils/logger'

export interface CalibrationData {
  screenWidth: number
  screenHeight: number
  calibrationPoints: CalibrationPoint[]
  sensitivity: number
}

export interface CalibrationPoint {
  screenX: number
  screenY: number
  gazeX: number
  gazeY: number
}

class EyeTrackingService {
  private calibrationData: CalibrationData | null = null
  private eyePresenceTimeout: NodeJS.Timeout | null = null
  private lastEyePresence = true
  private greatLexiconAudio: HTMLAudioElement | null = null
  
  async initialize(): Promise<void> {
    logger.info('Initializing Eye Tracking Service')
    
    try {
      // Initialize MediaPipe tracker
      const initialized = await mediaEyeTracker.initialize({
        onEyeContact: this.handleEyeContact.bind(this),
        onInitialized: this.handleInitialized.bind(this),
        onError: this.handleError.bind(this),
        onDetection: this.handleDetection.bind(this),
        debug: process.env.NODE_ENV === 'development'
      }, {
        threshold: 100,
        videoSize: { width: 640, height: 480 }
      })
      
      if (!initialized) {
        throw new Error('Failed to initialize MediaPipe tracker')
      }
      
      // Load GREAT LEXICON audio
      this.greatLexiconAudio = new Audio('/audio/great-lexicon-theme.mp3')
      this.greatLexiconAudio.loop = true
      
    } catch (error) {
      logger.error('Eye tracking initialization failed', error)
      throw error
    }
  }
  
  private handleEyeContact(isLookingAt: boolean, gazeX?: number, gazeY?: number): void {
    const store = useEyeTrackingStore.getState()
    
    // Update gaze position
    if (gazeX !== undefined && gazeY !== undefined) {
      const position = this.calibrateGazePosition(gazeX, gazeY)
      store.updateEyePosition(position)
    }
    
    // Handle eye presence detection
    this.handleEyePresence(isLookingAt)
  }
  
  private handleEyePresence(eyesDetected: boolean): void {
    const store = useEyeTrackingStore.getState()
    
    // Clear existing timeout
    if (this.eyePresenceTimeout) {
      clearTimeout(this.eyePresenceTimeout)
      this.eyePresenceTimeout = null
    }
    
    if (!eyesDetected && this.lastEyePresence) {
      // Eyes just left - start grace period
      logger.warn('Eyes lost - starting grace period')
      
      this.eyePresenceTimeout = setTimeout(() => {
        logger.error('GREAT LEXICON ACTIVATED - Eyes absent')
        store.setEyesOnScreen(false)
        this.activateGreatLexicon()
      }, 500) // 500ms grace period
      
    } else if (eyesDetected && !this.lastEyePresence) {
      // Eyes returned
      logger.info('Eyes returned - deactivating GREAT LEXICON')
      store.setEyesOnScreen(true)
      this.deactivateGreatLexicon()
    }
    
    this.lastEyePresence = eyesDetected
  }
  
  private activateGreatLexicon(): void {
    const store = useEyeTrackingStore.getState()
    store.activateGreatLexicon()
    
    // Play ominous audio
    if (this.greatLexiconAudio) {
      this.greatLexiconAudio.play().catch(e => 
        logger.error('Failed to play GREAT LEXICON audio', e)
      )
    }
    
    // Trigger visual effects in game
    document.body.classList.add('great-lexicon-active')
  }
  
  private deactivateGreatLexicon(): void {
    const store = useEyeTrackingStore.getState()
    store.deactivateGreatLexicon()
    
    // Stop audio
    if (this.greatLexiconAudio) {
      this.greatLexiconAudio.pause()
      this.greatLexiconAudio.currentTime = 0
    }
    
    // Remove visual effects
    document.body.classList.remove('great-lexicon-active')
  }
  
  private handleInitialized(): void {
    logger.info('Eye tracking initialized successfully')
    useEyeTrackingStore.getState().setTracking(true)
  }
  
  private handleError(error: { message: string }): void {
    logger.error('Eye tracking error', error)
    useEyeTrackingStore.getState().setTracking(false)
  }
  
  private handleDetection(detections: any[]): void {
    // Additional detection handling if needed
    if (detections.length === 0) {
      this.handleEyePresence(false)
    }
  }
  
  private calibrateGazePosition(rawX: number, rawY: number): { x: number; y: number } {
    if (!this.calibrationData) {
      // No calibration - return normalized values
      return {
        x: rawX / 640 * window.innerWidth,
        y: rawY / 480 * window.innerHeight
      }
    }
    
    // Apply calibration transformation
    // This is a simplified linear transformation - could be improved with ML
    const avgCalibration = this.calibrationData.calibrationPoints.reduce((acc, point) => {
      return {
        scaleX: acc.scaleX + (point.screenX / point.gazeX),
        scaleY: acc.scaleY + (point.screenY / point.gazeY),
        offsetX: acc.offsetX + (point.screenX - point.gazeX),
        offsetY: acc.offsetY + (point.screenY - point.gazeY)
      }
    }, { scaleX: 0, scaleY: 0, offsetX: 0, offsetY: 0 })
    
    const count = this.calibrationData.calibrationPoints.length
    const scaleX = avgCalibration.scaleX / count * this.calibrationData.sensitivity
    const scaleY = avgCalibration.scaleY / count * this.calibrationData.sensitivity
    const offsetX = avgCalibration.offsetX / count
    const offsetY = avgCalibration.offsetY / count
    
    return {
      x: Math.max(0, Math.min(window.innerWidth, rawX * scaleX + offsetX)),
      y: Math.max(0, Math.min(window.innerHeight, rawY * scaleY + offsetY))
    }
  }
  
  // Calibration flow methods
  async startCalibration(): Promise<void> {
    logger.info('Starting eye tracking calibration')
    
    const calibrationPoints: CalibrationPoint[] = []
    const positions = [
      { x: 0.1, y: 0.1 }, // Top left
      { x: 0.9, y: 0.1 }, // Top right
      { x: 0.5, y: 0.5 }, // Center
      { x: 0.1, y: 0.9 }, // Bottom left
      { x: 0.9, y: 0.9 }  // Bottom right
    ]
    
    // This would be integrated with a UI component
    // For now, just store mock calibration data
    this.calibrationData = {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      calibrationPoints: positions.map(pos => ({
        screenX: pos.x * window.innerWidth,
        screenY: pos.y * window.innerHeight,
        gazeX: pos.x * 640,
        gazeY: pos.y * 480
      })),
      sensitivity: 1.0
    }
    
    logger.info('Calibration complete', this.calibrationData)
  }
  
  setSensitivity(sensitivity: number): void {
    if (this.calibrationData) {
      this.calibrationData.sensitivity = Math.max(0.1, Math.min(3.0, sensitivity))
      logger.info(`Eye tracking sensitivity set to ${this.calibrationData.sensitivity}`)
    }
  }
  
  startTracking(targetElement?: HTMLElement): void {
    const element = targetElement || document.getElementById('game-viewport')
    if (element) {
      mediaEyeTracker.startTracking(element)
      logger.info('Eye tracking started')
    } else {
      logger.error('No target element for eye tracking')
    }
  }
  
  stopTracking(): void {
    mediaEyeTracker.stopTracking()
    useEyeTrackingStore.getState().setTracking(false)
    logger.info('Eye tracking stopped')
  }
  
  cleanup(): void {
    this.stopTracking()
    mediaEyeTracker.cleanup()
    
    if (this.eyePresenceTimeout) {
      clearTimeout(this.eyePresenceTimeout)
    }
    
    if (this.greatLexiconAudio) {
      this.greatLexiconAudio.pause()
      this.greatLexiconAudio = null
    }
    
    logger.info('Eye tracking service cleaned up')
  }
}

// Export singleton instance
export const eyeTrackingService = new EyeTrackingService()
export default eyeTrackingService