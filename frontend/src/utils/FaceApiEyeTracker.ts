// Eye Tracker using face-api.js - more stable than MediaPipe
import * as faceapi from 'face-api.js';

export interface EyeTrackingOptions {
  onEyeContact?: (isLookingAt: boolean, gazeX?: number, gazeY?: number) => void;
  onInitialized?: () => void;
  onError?: (error: { message: string }) => void;
  onDetection?: (detections: FaceDetection[]) => void;
  debug?: boolean;
  videoSize?: { width: number; height: number };
  threshold?: number;
}

export interface FaceDetection {
  yaw: number;
  pitch: number;
  mouthOpenRatio: number;
  eyesClosed: boolean;
  blink: boolean;
  faceCoords: [number, number];
  landmarks: any[];
}

export interface EyeTrackingConfig {
  debug?: boolean;
  videoSize?: { width: number; height: number };
  threshold?: number;
}

class FaceApiEyeTracker {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;
  private isInitialized = false;
  private isTracking = false;
  private targetElement: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private debugContainer: HTMLDivElement | null = null;
  
  // Callbacks
  private onEyeContactCallback?: (isLookingAt: boolean, gazeX?: number, gazeY?: number) => void;
  private onInitializedCallback?: () => void;
  private onErrorCallback?: (error: { message: string }) => void;
  private onDetectionCallback?: (detections: FaceDetection[]) => void;
  
  // Settings
  private debug = false;
  private videoSize = { width: 640, height: 480 };
  private threshold = 100;
  
  // State
  private lastDetections: FaceDetection[] = [];
  private modelsLoaded = false;
  private lastDetectionTime = 0;
  private detectionInterval = 100; // Detect every 100ms to reduce flicker
  private faceDetectedCount = 0;
  private noFaceCount = 0;
  private detectionThreshold = 3; // Need 3 consecutive detections to change state
  
  async initialize(
    options: EyeTrackingOptions = {},
    config: EyeTrackingConfig = {}
  ): Promise<boolean> {
    try {
      console.log('🚀 Starting face-api.js Eye Tracker initialization...');
      
      // Set callbacks and config
      this.onEyeContactCallback = options.onEyeContact;
      this.onInitializedCallback = options.onInitialized;
      this.onErrorCallback = options.onError;
      this.onDetectionCallback = options.onDetection;
      
      this.debug = config.debug ?? false;
      this.videoSize = config.videoSize ?? this.videoSize;
      this.threshold = config.threshold ?? this.threshold;
      
      // Load face-api.js models
      if (!this.modelsLoaded) {
        console.log('📦 Loading face-api.js models...');
        const MODEL_URL = '/models';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        this.modelsLoaded = true;
        console.log('✅ Models loaded successfully');
      }
      
      // Create video element
      console.log('📺 Creating video element...');
      this.videoElement = document.createElement('video');
      this.videoElement.width = this.videoSize.width;
      this.videoElement.height = this.videoSize.height;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      
      if (this.debug) {
        console.log('🎨 Debug mode enabled - creating visual overlay...');
        this.debugContainer = document.createElement('div');
        this.debugContainer.style.position = 'fixed';
        this.debugContainer.style.top = '10px';
        this.debugContainer.style.left = '10px';
        this.debugContainer.style.width = '320px';
        this.debugContainer.style.height = '240px';
        this.debugContainer.style.zIndex = '9999';
        this.debugContainer.style.border = '2px solid red';
        this.debugContainer.style.overflow = 'hidden';
        this.debugContainer.className = 'faceapi-debug-container';
        
        this.videoElement.style.width = '100%';
        this.videoElement.style.height = '100%';
        this.videoElement.style.objectFit = 'cover';
        this.videoElement.style.transform = 'scaleX(-1)'; // Mirror the video
        
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.style.position = 'absolute';
        this.canvasElement.style.top = '0';
        this.canvasElement.style.left = '0';
        this.canvasElement.style.width = '100%';
        this.canvasElement.style.height = '100%';
        this.canvasElement.style.pointerEvents = 'none';
        this.canvasElement.style.transform = 'scaleX(-1)'; // Mirror the canvas
        
        this.debugContainer.appendChild(this.videoElement);
        this.debugContainer.appendChild(this.canvasElement);
        document.body.appendChild(this.debugContainer);
      }
      
      // Initialize camera
      console.log('📹 Initializing camera...');
      await this.initCamera();
      
      this.isInitialized = true;
      
      if (this.onInitializedCallback) {
        this.onInitializedCallback();
      }
      
      console.log('✓ face-api.js Eye Tracker initialized successfully');
      return true;
      
    } catch (error: any) {
      console.error('✗ Failed to initialize face-api.js Eye Tracker:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback({
          message: error.message || 'Failed to initialize eye tracking'
        });
      }
      
      return false;
    }
  }
  
  private async initCamera(): Promise<void> {
    try {
      console.log('📷 Requesting camera access...');
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: this.videoSize.width,
          height: this.videoSize.height,
          facingMode: 'user'
        }
      });
      
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (this.videoElement) {
            this.videoElement.onloadedmetadata = () => {
              console.log('✅ Video metadata loaded');
              resolve();
            };
          }
        });
        
        await this.videoElement.play();
        console.log('✅ Camera initialized and playing');
        
        // Set canvas dimensions if in debug mode
        if (this.canvasElement && this.videoElement) {
          this.canvasElement.width = this.videoElement.videoWidth;
          this.canvasElement.height = this.videoElement.videoHeight;
        }
      }
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      throw new Error(`Failed to access camera: ${error}`);
    }
  }
  
  startTracking(targetElement: HTMLElement): boolean {
    console.log('🎯 Starting eye tracking...');
    
    if (!this.isInitialized) {
      console.error('❌ Eye tracker not initialized');
      return false;
    }
    
    this.targetElement = targetElement;
    this.isTracking = true;
    
    // Start detection loop
    if (!this.animationFrameId) {
      this.detectFaces();
    }
    
    console.log('✅ Eye tracking started');
    return true;
  }
  
  stopTracking(): void {
    this.isTracking = false;
    this.targetElement = null;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('✓ Eye tracking stopped');
  }
  
  private async detectFaces(): Promise<void> {
    if (!this.videoElement || !this.isTracking) {
      return;
    }
    
    const now = Date.now();
    const shouldDetect = now - this.lastDetectionTime >= this.detectionInterval;
    
    if (shouldDetect) {
      this.lastDetectionTime = now;
      
      try {
        // Detect faces with landmarks - use more sensitive options
        const detections = await faceapi
          .detectAllFaces(this.videoElement, new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.3 // Lower threshold for better detection
          }))
          .withFaceLandmarks()
          .withFaceExpressions();
        
        if (detections.length > 0) {
          // Face detected
          this.faceDetectedCount++;
          this.noFaceCount = 0;
          
          const detection = detections[0];
          const landmarks = detection.landmarks;
          
          // Extract eye landmarks
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          
          // Calculate eye center
          const leftEyeCenter = this.getCenter(leftEye);
          const rightEyeCenter = this.getCenter(rightEye);
          const eyeCenter = {
            x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
            y: (leftEyeCenter.y + rightEyeCenter.y) / 2
          };
          
          // Mirror the x coordinate for selfie mode
          const mirroredEyeCenter = {
            x: this.videoElement.videoWidth - eyeCenter.x,
            y: eyeCenter.y
          };
          
          // Only report state changes after threshold is met
          if (this.faceDetectedCount >= this.detectionThreshold) {
            if (this.onEyeContactCallback) {
              this.onEyeContactCallback(true, mirroredEyeCenter.x, mirroredEyeCenter.y);
            }
          }
          
          // Draw debug visualization
          if (this.debug && this.canvasElement) {
            const ctx = this.canvasElement.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
              
              // Save context state
              ctx.save();
              
              // Draw face detection box
              const box = detection.detection.box;
              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 2;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
              
              // Draw eye points
              ctx.fillStyle = '#ff0000';
              leftEye.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                ctx.fill();
              });
              rightEye.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                ctx.fill();
              });
              
              // Draw eye center
              ctx.fillStyle = '#0000ff';
              ctx.beginPath();
              ctx.arc(eyeCenter.x, eyeCenter.y, 5, 0, 2 * Math.PI);
              ctx.fill();
              
              // Restore context state
              ctx.restore();
            }
          }
          
          // Convert to FaceDetection format
          const faceDetection: FaceDetection = {
            yaw: 0, // Not directly available in face-api.js
            pitch: 0, // Not directly available in face-api.js
            mouthOpenRatio: detection.expressions.surprised || 0,
            eyesClosed: false, // Would need more complex calculation
            blink: false,
            faceCoords: [eyeCenter.x, eyeCenter.y],
            landmarks: landmarks.positions
          };
          
          this.lastDetections = [faceDetection];
          
          if (this.onDetectionCallback) {
            this.onDetectionCallback(this.lastDetections);
          }
        } else {
          // No face detected
          this.noFaceCount++;
          this.faceDetectedCount = 0;
          
          // Only report eyes lost after threshold is met
          if (this.noFaceCount >= this.detectionThreshold) {
            if (this.onEyeContactCallback) {
              this.onEyeContactCallback(false);
            }
          }
          
          if (this.debug && this.canvasElement) {
            const ctx = this.canvasElement.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
              
              // Draw "No face detected" message with count
              ctx.fillStyle = '#ff0000';
              ctx.font = '20px Arial';
              ctx.fillText(`No face detected (${this.noFaceCount}/${this.detectionThreshold})`, 10, 30);
            }
          }
        }
      } catch (error) {
        console.error('Error in face detection:', error);
      }
    }
    
    // Continue detection loop
    this.animationFrameId = requestAnimationFrame(() => this.detectFaces());
  }
  
  private getCenter(points: faceapi.Point[]): { x: number; y: number } {
    const sum = points.reduce((acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y
    }), { x: 0, y: 0 });
    
    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  }
  
  private isPointNearTarget(point: { x: number; y: number }, targetRect: DOMRect): boolean {
    // Convert video coordinates to screen coordinates
    // This is a simplified version - you might need to adjust based on video/screen mapping
    const screenX = point.x * (window.innerWidth / this.videoSize.width);
    const screenY = point.y * (window.innerHeight / this.videoSize.height);
    
    return (
      screenX >= targetRect.left - this.threshold &&
      screenX <= targetRect.right + this.threshold &&
      screenY >= targetRect.top - this.threshold &&
      screenY <= targetRect.bottom + this.threshold
    );
  }
  
  cleanup(): void {
    console.log('🧹 Cleaning up eye tracker...');
    
    this.stopTracking();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.debugContainer && this.debugContainer.parentNode) {
      this.debugContainer.parentNode.removeChild(this.debugContainer);
    }
    
    this.videoElement = null;
    this.canvasElement = null;
    this.debugContainer = null;
    this.isInitialized = false;
    
    console.log('✓ Cleanup complete');
  }
  
  setThreshold(threshold: number): void {
    this.threshold = threshold;
  }
  
  getLastDetections(): FaceDetection[] {
    return this.lastDetections;
  }
  
  isReady(): boolean {
    return this.isInitialized && this.isTracking;
  }
  
  setDebugViewVisible(visible: boolean): void {
    if (this.debugContainer) {
      this.debugContainer.style.display = visible ? 'block' : 'none';
    }
  }
  
  setDebugViewPosition(x: number, y: number): void {
    if (this.debugContainer) {
      this.debugContainer.style.left = `${x}px`;
      this.debugContainer.style.top = `${y}px`;
    }
  }
  
  getDebugContainer(): HTMLDivElement | null {
    return this.debugContainer;
  }
}

// Create singleton instance
const faceApiEyeTracker = new FaceApiEyeTracker();

export default faceApiEyeTracker;