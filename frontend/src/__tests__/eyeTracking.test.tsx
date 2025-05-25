import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEyeTrackingStore } from '@store/useEyeTrackingStore'
import EyeTrackingCalibration from '@components/EyeTrackingCalibration'
import GreatLexicon from '@components/GreatLexicon'
import { useEyeTracking } from '@hooks/useEyeTracking'

// Mock MediaPipe
jest.mock('@utils/MediaPipeEyeTracker', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn().mockResolvedValue(true),
    startTracking: jest.fn(),
    stopTracking: jest.fn(),
    cleanup: jest.fn(),
    setThreshold: jest.fn()
  }
}))

// Mock eye tracking service
jest.mock('@services/EyeTrackingService', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn().mockResolvedValue(undefined),
    startTracking: jest.fn(),
    stopTracking: jest.fn(),
    startCalibration: jest.fn().mockResolvedValue(undefined),
    setSensitivity: jest.fn(),
    cleanup: jest.fn()
  }
}))

describe('Eye Tracking System', () => {
  beforeEach(() => {
    // Reset store state
    useEyeTrackingStore.setState({
      isTracking: false,
      isEyesOnScreen: true,
      lastEyePosition: null,
      isGreatLexiconActive: false
    })
  })
  
  describe('EyeTrackingCalibration', () => {
    it('should render calibration UI when not tracking', () => {
      render(
        <EyeTrackingCalibration 
          onComplete={jest.fn()} 
          onSkip={jest.fn()}
        />
      )
      
      expect(screen.getByText('Eye Tracking Setup Required')).toBeInTheDocument()
    })
    
    it('should show calibration instructions when tracking is ready', async () => {
      // Set tracking to true
      act(() => {
        useEyeTrackingStore.setState({ isTracking: true })
      })
      
      render(
        <EyeTrackingCalibration 
          onComplete={jest.fn()} 
          onSkip={jest.fn()}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('Eye Tracking Calibration')).toBeInTheDocument()
      })
    })
    
    it('should call onSkip when skip button is clicked', async () => {
      const onSkip = jest.fn()
      
      act(() => {
        useEyeTrackingStore.setState({ isTracking: true })
      })
      
      render(
        <EyeTrackingCalibration 
          onComplete={jest.fn()} 
          onSkip={onSkip}
        />
      )
      
      const skipButton = await screen.findByText('Skip Calibration')
      await userEvent.click(skipButton)
      
      expect(onSkip).toHaveBeenCalled()
    })
  })
  
  describe('GreatLexicon', () => {
    it('should not render when inactive', () => {
      render(<GreatLexicon />)
      
      expect(screen.queryByText('THE GREAT LEXICON')).not.toBeInTheDocument()
    })
    
    it('should render when active', () => {
      act(() => {
        useEyeTrackingStore.setState({ isGreatLexiconActive: true })
      })
      
      render(<GreatLexicon />)
      
      expect(screen.getByText('THE GREAT LEXICON')).toBeInTheDocument()
    })
    
    it('should show escalating warnings', async () => {
      act(() => {
        useEyeTrackingStore.setState({ isGreatLexiconActive: true })
      })
      
      render(<GreatLexicon />)
      
      // Wait for critical warning to appear
      await waitFor(() => {
        expect(screen.getByText(/Return your gaze immediately/)).toBeInTheDocument()
      }, { timeout: 7000 })
    })
  })
  
  describe('useEyeTracking hook', () => {
    const TestComponent = ({ options }: { options?: any }) => {
      const {
        isTracking,
        isEyesOnScreen,
        eyePosition,
        isGreatLexiconActive
      } = useEyeTracking(options)
      
      return (
        <div>
          <div>Tracking: {isTracking ? 'Yes' : 'No'}</div>
          <div>Eyes on screen: {isEyesOnScreen ? 'Yes' : 'No'}</div>
          <div>GREAT LEXICON: {isGreatLexiconActive ? 'Active' : 'Inactive'}</div>
          {eyePosition && (
            <div>Position: {eyePosition.x}, {eyePosition.y}</div>
          )}
        </div>
      )
    }
    
    it('should provide eye tracking state', () => {
      render(<TestComponent />)
      
      expect(screen.getByText('Tracking: No')).toBeInTheDocument()
      expect(screen.getByText('Eyes on screen: Yes')).toBeInTheDocument()
      expect(screen.getByText('GREAT LEXICON: Inactive')).toBeInTheDocument()
    })
    
    it('should call callbacks when eyes are lost/found', async () => {
      const onEyesLost = jest.fn()
      const onEyesFound = jest.fn()
      
      render(
        <TestComponent 
          options={{ 
            onEyesLost, 
            onEyesFound,
            autoStart: false 
          }} 
        />
      )
      
      // Simulate eyes lost
      act(() => {
        useEyeTrackingStore.setState({ isEyesOnScreen: false })
      })
      
      await waitFor(() => {
        expect(onEyesLost).toHaveBeenCalled()
      })
      
      // Simulate eyes found
      act(() => {
        useEyeTrackingStore.setState({ isEyesOnScreen: true })
      })
      
      await waitFor(() => {
        expect(onEyesFound).toHaveBeenCalled()
      })
    })
  })
  
  describe('Eye Tracking Store', () => {
    it('should activate GREAT LEXICON when eyes leave screen', () => {
      const { setEyesOnScreen } = useEyeTrackingStore.getState()
      
      act(() => {
        setEyesOnScreen(false)
      })
      
      const state = useEyeTrackingStore.getState()
      expect(state.isEyesOnScreen).toBe(false)
      expect(state.isGreatLexiconActive).toBe(true)
    })
    
    it('should deactivate GREAT LEXICON when eyes return', () => {
      // First activate it
      act(() => {
        useEyeTrackingStore.setState({ 
          isEyesOnScreen: false,
          isGreatLexiconActive: true 
        })
      })
      
      // Then eyes return
      const { setEyesOnScreen } = useEyeTrackingStore.getState()
      
      act(() => {
        setEyesOnScreen(true)
      })
      
      const state = useEyeTrackingStore.getState()
      expect(state.isEyesOnScreen).toBe(true)
      expect(state.isGreatLexiconActive).toBe(false)
    })
  })
})