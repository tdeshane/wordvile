import React, { useState, useEffect, useCallback } from 'react'
import { useEyeTrackingStore } from '@store/useEyeTrackingStore'
import eyeTrackingService from '@services/EyeTrackingService'
import logger from '@utils/logger'
import '@styles/EyeTrackingCalibration.css'

interface CalibrationPoint {
  id: number
  x: number
  y: number
  completed: boolean
}

interface EyeTrackingCalibrationProps {
  onComplete: () => void
  onSkip?: () => void
}

export const EyeTrackingCalibration: React.FC<EyeTrackingCalibrationProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [currentPoint, setCurrentPoint] = useState(0)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [sensitivity, setSensitivity] = useState(1.0)
  
  const eyePosition = useEyeTrackingStore(state => state.lastEyePosition)
  const isTracking = useEyeTrackingStore(state => state.isTracking)
  
  const calibrationPoints: CalibrationPoint[] = [
    { id: 0, x: 10, y: 10, completed: false },      // Top left
    { id: 1, x: 90, y: 10, completed: false },      // Top right
    { id: 2, x: 50, y: 50, completed: false },      // Center
    { id: 3, x: 10, y: 90, completed: false },      // Bottom left
    { id: 4, x: 90, y: 90, completed: false },      // Bottom right
  ]
  
  const [points, setPoints] = useState(calibrationPoints)
  
  useEffect(() => {
    // Initialize eye tracking when component mounts
    const initTracking = async () => {
      try {
        await eyeTrackingService.initialize()
        eyeTrackingService.startTracking()
      } catch (error) {
        logger.error('Failed to initialize eye tracking', error)
      }
    }
    
    initTracking()
    
    return () => {
      // Cleanup on unmount
      eyeTrackingService.stopTracking()
    }
  }, [])
  
  const startCalibration = useCallback(() => {
    setIsCalibrating(true)
    setCurrentPoint(0)
    nextCalibrationPoint()
  }, [])
  
  const nextCalibrationPoint = useCallback(() => {
    if (currentPoint >= points.length) {
      completeCalibration()
      return
    }
    
    // Start countdown for current point
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          captureCalibrationPoint()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [currentPoint, points.length])
  
  const captureCalibrationPoint = useCallback(() => {
    logger.info(`Capturing calibration point ${currentPoint}`)
    
    // Mark point as completed
    setPoints(prev => prev.map(p => 
      p.id === currentPoint ? { ...p, completed: true } : p
    ))
    
    // Move to next point
    setCurrentPoint(prev => prev + 1)
    
    // Small delay before next point
    setTimeout(() => {
      if (currentPoint + 1 < points.length) {
        nextCalibrationPoint()
      } else {
        completeCalibration()
      }
    }, 500)
  }, [currentPoint, points.length])
  
  const completeCalibration = useCallback(() => {
    setIsCalibrating(false)
    eyeTrackingService.setSensitivity(sensitivity)
    eyeTrackingService.startCalibration()
    logger.info('Calibration completed')
    onComplete()
  }, [sensitivity, onComplete])
  
  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setSensitivity(value)
    eyeTrackingService.setSensitivity(value)
  }
  
  if (!isTracking) {
    return (
      <div className="calibration-container">
        <div className="calibration-content">
          <h2>Eye Tracking Setup Required</h2>
          <p>Please allow camera access when prompted.</p>
          <p>Make sure your face is well-lit and clearly visible.</p>
          <div className="calibration-status">
            <div className="status-indicator error">
              Camera Not Ready
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!isCalibrating) {
    return (
      <div className="calibration-container">
        <div className="calibration-content">
          <h2>Eye Tracking Calibration</h2>
          <p>For the best experience, we need to calibrate the eye tracking to your setup.</p>
          <p>You'll need to look at 5 points on the screen.</p>
          
          <div className="sensitivity-control">
            <label>Gaze Sensitivity:</label>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1" 
              value={sensitivity}
              onChange={handleSensitivityChange}
            />
            <span>{sensitivity.toFixed(1)}</span>
          </div>
          
          <div className="calibration-actions">
            <button 
              className="btn-primary"
              onClick={startCalibration}
            >
              Start Calibration
            </button>
            {onSkip && (
              <button 
                className="btn-secondary"
                onClick={onSkip}
              >
                Skip Calibration
              </button>
            )}
          </div>
          
          <div className="calibration-tips">
            <h3>Tips for best results:</h3>
            <ul>
              <li>Sit at a comfortable distance from your screen</li>
              <li>Keep your head relatively still during calibration</li>
              <li>Look directly at each point when it appears</li>
              <li>Ensure good lighting on your face</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="calibration-container calibrating">
      <div className="calibration-overlay">
        {/* Calibration points */}
        {points.map((point, index) => (
          <div
            key={point.id}
            className={`calibration-point ${
              index === currentPoint ? 'active' : ''
            } ${point.completed ? 'completed' : ''}`}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`
            }}
          >
            <div className="point-marker">
              {index === currentPoint && countdown > 0 && (
                <div className="countdown">{countdown}</div>
              )}
            </div>
          </div>
        ))}
        
        {/* Eye position indicator */}
        {eyePosition && (
          <div 
            className="eye-position-indicator"
            style={{
              left: `${eyePosition.x}px`,
              top: `${eyePosition.y}px`
            }}
          />
        )}
        
        {/* Instructions */}
        <div className="calibration-instructions">
          {countdown > 0 ? (
            <p>Look at the highlighted point...</p>
          ) : (
            <p>Move to next point...</p>
          )}
          <div className="progress">
            Point {currentPoint + 1} of {points.length}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EyeTrackingCalibration