# Eye Tracking System Documentation

## Overview

The Wordvile eye tracking system uses MediaPipe Face Mesh to enable gaze-based controls and implement the GREAT LEXICON mechanic - an omnipotent force that activates when players look away from the screen.

## Architecture

### Components

1. **EyeTrackingService** (`src/services/EyeTrackingService.ts`)
   - Core service managing MediaPipe integration
   - Handles calibration and gaze position calculation
   - Manages GREAT LEXICON activation/deactivation

2. **useEyeTrackingStore** (`src/store/useEyeTrackingStore.ts`)
   - Zustand store for global eye tracking state
   - Tracks eye presence, position, and GREAT LEXICON status

3. **EyeTrackingCalibration** (`src/components/EyeTrackingCalibration.tsx`)
   - Calibration UI for first-time users
   - 5-point calibration system
   - Sensitivity adjustment controls

4. **GreatLexicon** (`src/components/GreatLexicon.tsx`)
   - Black screen overlay when eyes are lost
   - Escalating warnings and void corruption meter
   - Multiverse threat visualization

5. **useEyeTracking** (`src/hooks/useEyeTracking.ts`)
   - React hook for easy integration
   - Provides state and actions for eye tracking

## Usage

### Basic Integration

```typescript
import { useEyeTracking } from '@hooks/useEyeTracking'

function GameComponent() {
  const {
    isTracking,
    isEyesOnScreen,
    eyePosition,
    isGreatLexiconActive
  } = useEyeTracking({
    onEyesLost: () => console.log('Eyes lost!'),
    onEyesFound: () => console.log('Eyes returned!'),
    autoStart: true
  })
  
  // Pause game logic when GREAT LEXICON is active
  if (isGreatLexiconActive) {
    return <div>Game Paused - Return your gaze!</div>
  }
  
  // Use eye position for controls
  if (eyePosition) {
    // Move character based on gaze
  }
}
```

### Manual Control

```typescript
const { startTracking, stopTracking, recalibrate } = useEyeTracking({
  autoStart: false
})

// Start when ready
await startTracking()

// Recalibrate if needed
await recalibrate()

// Clean up
stopTracking()
```

## The GREAT LEXICON System

### Activation Conditions
- Eyes leave camera view for more than 500ms
- Face not detected by MediaPipe
- Tracking errors or camera issues

### Effects When Active
- Screen goes completely black
- Game state freezes
- Ominous audio plays
- Void corruption increases over time
- Threatening messages appear

### Deactivation
- Automatically deactivates when eyes return
- Game state resumes from where it paused
- No progress is lost

## Calibration

### Process
1. User looks at 5 points on screen
2. System captures gaze coordinates at each point
3. Calibration data used to transform raw gaze to screen coordinates
4. Sensitivity can be adjusted (0.5x to 2.0x)

### Storage
- Calibration state saved to localStorage
- Users can skip calibration (uses default mapping)
- Recalibration available through settings

## Performance Considerations

### Optimization Tips
- Eye tracking runs at ~30 FPS
- Grace period of 500ms prevents false triggers
- Debug mode shows face mesh overlay (disable in production)
- Consider reducing video resolution on low-end devices

### Browser Requirements
- Chrome/Edge 79+ (recommended)
- Firefox 86+ (limited support)
- Safari 14.1+ (requires permissions)
- HTTPS required for camera access

## Troubleshooting

### Common Issues

1. **"MediaPipe FaceMesh not available"**
   - Ensure CDN scripts are loaded in index.html
   - Check network connectivity
   - Verify CORS headers

2. **Camera Permission Denied**
   - User must allow camera access
   - Check browser permissions settings
   - HTTPS required

3. **Poor Tracking Accuracy**
   - Ensure good lighting on face
   - Sit 50-70cm from screen
   - Run calibration process
   - Adjust sensitivity settings

4. **GREAT LEXICON Activating Too Often**
   - Increase grace period in EyeTrackingService
   - Adjust detection threshold
   - Check camera positioning

## Testing

### Unit Tests
```bash
npm test -- eyeTracking.test.tsx
```

### E2E Tests
```bash
npm run test:playwright -- eye_tracking.spec.ts
```

### Manual Testing
1. Enable debug mode in development
2. Check console for tracking logs
3. Test with different lighting conditions
4. Verify GREAT LEXICON activation/deactivation

## Security & Privacy

- Camera feed processed locally only
- No video data sent to servers
- MediaPipe runs entirely in browser
- Users can disable at any time
- Clear permission prompts

## Future Enhancements

- Machine learning calibration improvement
- Multi-face support for spectator mode
- Gesture recognition integration
- Emotion detection for gameplay
- Accessibility alternatives