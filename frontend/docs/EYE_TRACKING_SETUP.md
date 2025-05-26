# Eye Tracking Setup and Troubleshooting

## Overview
The Wordvile eye tracking system uses face-api.js for face detection and eye tracking. When eyes leave the screen for more than 2 seconds, the GREAT LEXICON activates, pausing the game until the player returns their gaze.

## Current Implementation (as of PR-003)

### Architecture
- **Face Detection**: face-api.js with TinyFaceDetector
- **Eye Tracking Service**: `/src/services/EyeTrackingService.ts`
- **Face API Tracker**: `/src/utils/FaceApiEyeTracker.ts`
- **UI Components**: 
  - `/src/components/GreatLexicon.tsx` - The overlay when eyes are lost
  - `/src/components/EyeTrackingCalibration.tsx` - Calibration UI

### Key Features
1. **2-second grace period** before GREAT LEXICON activates
2. **Mirrored video** for natural selfie-mode interaction
3. **Debug visualization** showing face detection status
4. **Threshold detection** - requires 3 consecutive detections to change state

## Setup Instructions

### Prerequisites
1. Camera/webcam connected
2. Good lighting for face detection
3. Models in `/public/models/` directory

### Testing
1. Start the app: `npm run dev`
2. Silver's Challenge tab opens by default
3. Click "Start Eye Tracking" button
4. Allow camera permissions when prompted
5. Your face should be detected (green box in debug mode)

### Testing GREAT LEXICON
1. Cover your camera or look away
2. Console shows: "Eyes lost - starting grace period"
3. After 2 seconds: "GREAT LEXICON ACTIVATED"
4. The GREAT LEXICON overlay appears
5. Look back at screen to deactivate

## Troubleshooting

### Common Issues

#### "Cannot access 'zombieEyesRef' before initialization"
**Solution**: Refs must be declared before hooks that use them. Fixed in SilverGame.tsx.

#### MediaPipe errors (face_detection_short_range.tflite)
**Solution**: We migrated from MediaPipe to face-api.js. Remove MediaPipe scripts from index.html.

#### GREAT LEXICON not activating
**Solution**: The timeout was being cleared on every eye detection update. Fixed by only clearing timeout when eyes return, not when they remain absent.

#### Environment variable errors (process is not defined)
**Solution**: Replace `process.env.REACT_APP_*` with `import.meta.env.VITE_*` for Vite compatibility.

### Debug Mode
Enable debug mode to see:
- Face detection visualization
- Detection count (e.g., "No face detected (2/3)")
- Eye position coordinates

## Technical Details

### Grace Period Logic
```typescript
if (!eyesDetected && this.lastEyePresence) {
  // Eyes just left - start grace period
  this.eyePresenceTimeout = setTimeout(() => {
    activateGreatLexicon()
  }, 2000)
} else if (eyesDetected && !this.lastEyePresence) {
  // Eyes returned - clear timeout
  clearTimeout(this.eyePresenceTimeout)
} else if (!eyesDetected && !this.lastEyePresence) {
  // Eyes still absent - DON'T clear timeout
}
```

### Model Files Required
- tiny_face_detector_model-*
- face_landmark_68_model-*
- face_recognition_model-*
- face_expression_model-*

## Future Improvements
1. Add actual eye gaze tracking (not just face presence)
2. Implement calibration system for better accuracy
3. Add audio cues for GREAT LEXICON activation
4. Performance optimization for lower-end devices