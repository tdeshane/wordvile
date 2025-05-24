// Enhanced Eye Tracker using MediaPipe Face Mesh via CDN
// Based on face-controls implementation with better reliability and performance

// MediaPipe is loaded via CDN scripts in index.html and available globally
declare global {
  interface Window {
    FaceMesh: any;
    drawConnectors: any;
    FACEMESH_TESSELATION: any;
    FACEMESH_RIGHT_EYE: any;
    FACEMESH_LEFT_EYE: any;
    FACEMESH_FACE_OVAL: any;
    FACEMESH_LEFT_IRIS?: any;
    FACEMESH_RIGHT_IRIS?: any;
  }
}

export interface EyeTrackingOptions {
  onEyeContact?: (isLookingAt: boolean) => void;
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

class MediaPipeEyeTracker {
  private faceMesh: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private isInitialized = false;
  private isTracking = false;
  private targetElement: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  
  // Callbacks
  private onEyeContactCallback?: (isLookingAt: boolean) => void;
  private onInitializedCallback?: () => void;
  private onErrorCallback?: (error: { message: string }) => void;
  private onDetectionCallback?: (detections: FaceDetection[]) => void;
  
  // Settings
  private debug = false;
  private videoSize = { width: 640, height: 480 };
  private threshold = 100;
  private blinkThreshold = 0.2;
  
  // State
  private prevEyesClosed: boolean[] = [];
  private lastDetections: FaceDetection[] = [];
  
  async initialize(
    options: EyeTrackingOptions = {},
    config: EyeTrackingConfig = {}
  ): Promise<boolean> {
    try {
      console.log('🚀 Starting MediaPipe Eye Tracker initialization...');
      
      // Check if MediaPipe is available
      if (typeof window.FaceMesh === 'undefined') {
        console.error('❌ MediaPipe FaceMesh not available');
        throw new Error('MediaPipe FaceMesh not available. Make sure CDN scripts are loaded.');
      }
      console.log('✅ MediaPipe FaceMesh is available');
      
      // Check other MediaPipe utilities
      console.log('MediaPipe utilities check:', {
        drawConnectors: typeof window.drawConnectors,
        FACEMESH_TESSELATION: typeof window.FACEMESH_TESSELATION,
        FACEMESH_RIGHT_EYE: typeof window.FACEMESH_RIGHT_EYE,
        FACEMESH_LEFT_EYE: typeof window.FACEMESH_LEFT_EYE,
        FACEMESH_FACE_OVAL: typeof window.FACEMESH_FACE_OVAL
      });
      
      // Set callbacks and config
      this.onEyeContactCallback = options.onEyeContact;
      this.onInitializedCallback = options.onInitialized;
      this.onErrorCallback = options.onError;
      this.onDetectionCallback = options.onDetection;
      
      this.debug = config.debug ?? false;
      this.videoSize = config.videoSize ?? this.videoSize;
      this.threshold = config.threshold ?? this.threshold;
      
      console.log('Configuration:', {
        debug: this.debug,
        videoSize: this.videoSize,
        threshold: this.threshold
      });
      
      // Create video element
      console.log('📺 Creating video element...');
      this.videoElement = document.createElement('video');
      this.videoElement.width = this.videoSize.width;
      this.videoElement.height = this.videoSize.height;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      
      if (this.debug) {
        console.log('🎨 Debug mode enabled - creating visual overlay...');
        // Create container for video and canvas overlay
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.left = '10px';
        container.style.width = '320px';
        container.style.height = '240px';
        container.style.zIndex = '9999';
        container.style.border = '2px solid red';
        container.style.overflow = 'hidden';
        
        // Style video element
        this.videoElement.style.width = '100%';
        this.videoElement.style.height = '100%';
        this.videoElement.style.objectFit = 'cover';
        
        // Create canvas overlay for face mesh
        this.canvasElement = document.createElement('canvas');
        // Canvas dimensions will be set after video loads
        this.canvasElement.style.position = 'absolute';
        this.canvasElement.style.top = '0';
        this.canvasElement.style.left = '0';
        this.canvasElement.style.width = '100%';
        this.canvasElement.style.height = '100%';
        this.canvasElement.style.pointerEvents = 'none';
        
        this.canvasCtx = this.canvasElement.getContext('2d');
        console.log('Canvas context created:', this.canvasCtx ? '✅' : '❌');
        
        container.appendChild(this.videoElement);
        container.appendChild(this.canvasElement);
        document.body.appendChild(container);
        console.log('✅ Debug overlay container added to DOM');
      }
      
      // Initialize MediaPipe FaceMesh
      console.log('🤖 Initializing MediaPipe FaceMesh...');
      this.faceMesh = new window.FaceMesh({
        locateFile: (file: string) => {
          const url = `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          console.log(`Loading MediaPipe file: ${url}`);
          return url;
        }
      });
      
      console.log('⚙️ Setting MediaPipe options...');
      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      console.log('📡 Setting up onResults callback...');
      this.faceMesh.onResults((results: any) => this.onResults(results));
      
      // Initialize camera manually (like face-controls)
      console.log('📹 Initializing camera...');
      await this.initCamera();
      
      this.isInitialized = true;
      
      if (this.onInitializedCallback) {
        this.onInitializedCallback();
      }
      
      console.log('✓ MediaPipe Eye Tracker initialized successfully');
      return true;
      
    } catch (error: any) {
      console.error('✗ Failed to initialize MediaPipe Eye Tracker:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback({
          message: error.message || 'Failed to initialize eye tracking'
        });
      }
      
      return false;
    }
  }
  
  startTracking(targetElement: HTMLElement): boolean {
    console.log('🎯 Starting eye tracking...');
    
    if (!this.isInitialized || !this.faceMesh) {
      console.error('❌ Eye tracker not initialized');
      return false;
    }
    
    this.targetElement = targetElement;
    this.isTracking = true;
    
    console.log('✅ Eye tracking started, target element:', targetElement.tagName);
    console.log('Tracker state:', {
      isInitialized: this.isInitialized,
      isTracking: this.isTracking,
      faceMesh: !!this.faceMesh,
      videoElement: !!this.videoElement,
      stream: !!this.stream
    });
    
    // Restart frame processing if it's not running
    if (!this.animationFrameId && this.isInitialized) {
      console.log('🔄 Restarting frame processing loop...');
      this.processFrame();
    }
    
    return true;
  }
  
  stopTracking(): void {
    this.isTracking = false;
    this.targetElement = null;
    console.log('✓ Eye tracking stopped');
  }
  
  setThreshold(threshold: number): void {
    this.threshold = threshold;
  }
  
  cleanup(): void {
    this.stopTracking();
    
    // Stop animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Stop media stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement) {
      const container = this.videoElement.parentNode;
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    
    this.canvasElement = null;
    this.canvasCtx = null;
    
    this.faceMesh = null;
    this.isInitialized = false;
    
    console.log('✓ Eye tracker cleaned up');
  }
  
  private onResults(results: any): void {
    console.log('📊 onResults called', {
      isTracking: this.isTracking,
      debug: this.debug,
      hasMultiFaceLandmarks: !!results.multiFaceLandmarks,
      numFaces: results.multiFaceLandmarks?.length || 0,
      hasImage: !!results.image,
      canvasElement: !!this.canvasElement,
      canvasCtx: !!this.canvasCtx
    });
    
    if (!this.isTracking) {
      console.log('⏸️ Not tracking, skipping results');
      return;
    }
    
    // Draw on canvas if in debug mode (like face-controls)
    if (this.debug && this.canvasCtx && this.canvasElement) {
      console.log('🎨 Drawing on canvas...', {
        canvasWidth: this.canvasElement.width,
        canvasHeight: this.canvasElement.height,
        hasImage: !!results.image
      });
      
      this.canvasCtx.save();
      this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      
      // Mirror the camera view horizontally (like face-controls)
      this.canvasCtx.translate(this.canvasElement.width, 0);
      this.canvasCtx.scale(-1, 1);
      
      // Draw the video frame first (like face-controls)
      if (results.image) {
        console.log('🖼️ Drawing video frame');
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);
      } else {
        console.log('⚠️ No image in results');
      }
      
      // Draw face mesh if faces detected
      if (results.multiFaceLandmarks) {
        console.log(`🎭 Drawing face mesh for ${results.multiFaceLandmarks.length} face(s)`);
        for (const landmarks of results.multiFaceLandmarks) {
          // Draw face mesh
          if (window.drawConnectors && window.FACEMESH_TESSELATION) {
            console.log('🔗 Drawing tesselation');
            window.drawConnectors(this.canvasCtx, landmarks, window.FACEMESH_TESSELATION, {color: '#C0C0C0', lineWidth: 1});
          } else {
            console.log('⚠️ Missing drawConnectors or FACEMESH_TESSELATION');
          }
          
          // Draw eyes
          if (window.FACEMESH_RIGHT_EYE && window.FACEMESH_LEFT_EYE) {
            console.log('👁️ Drawing eyes');
            window.drawConnectors(this.canvasCtx, landmarks, window.FACEMESH_RIGHT_EYE, {color: '#FF0000', lineWidth: 1});
            window.drawConnectors(this.canvasCtx, landmarks, window.FACEMESH_LEFT_EYE, {color: '#FF0000', lineWidth: 1});
          } else {
            console.log('⚠️ Missing eye landmark constants');
          }
          
          // Draw face oval
          if (window.FACEMESH_FACE_OVAL) {
            console.log('⭕ Drawing face oval');
            window.drawConnectors(this.canvasCtx, landmarks, window.FACEMESH_FACE_OVAL, {color: '#E0E0E0', lineWidth: 1});
          } else {
            console.log('⚠️ Missing FACEMESH_FACE_OVAL');
          }
        }
      } else {
        console.log('😐 No face landmarks detected');
      }
      
      this.canvasCtx.restore();
      console.log('✅ Canvas drawing complete');
    }
    
    // Process face detection data
    if (!results.multiFaceLandmarks) {
      return;
    }
    
    const faces = results.multiFaceLandmarks;
    const detections: FaceDetection[] = [];
    
    for (let i = 0; i < faces.length; i++) {
      const landmarks = faces[i];
      
      // Ensure we have enough prev states
      if (this.prevEyesClosed.length <= i) {
        this.prevEyesClosed.push(false);
      }
      
      // Calculate face metrics
      const detection = this.calculateFaceMetrics(landmarks, i);
      detections.push(detection);
      
      // Check eye contact if we have a target
      if (this.targetElement && i === 0) { // Only check first face
        const isLookingAt = this.checkEyeContact(detection);
        
        if (this.onEyeContactCallback) {
          this.onEyeContactCallback(isLookingAt);
        }
      }
    }
    
    this.lastDetections = detections;
    
    if (this.onDetectionCallback) {
      this.onDetectionCallback(detections);
    }
  }
  
  private calculateFaceMetrics(landmarks: any[], faceIndex: number): FaceDetection {
    // Get actual video dimensions (like face-controls)
    const actualWidth = this.videoElement?.videoWidth || this.videoSize.width;
    const actualHeight = this.videoElement?.videoHeight || this.videoSize.height;
    
    // Face position (nose tip)
    const fx = landmarks[1].x * actualWidth;
    const fy = landmarks[1].y * actualHeight;
    
    // Approximate yaw/pitch from nose position
    const yaw = (landmarks[1].x - 0.5) * 2;
    const pitch = (landmarks[1].y - 0.5) * 2;
    
    // Mouth open ratio
    const ul = landmarks[13]; // Upper lip
    const ll = landmarks[14]; // Lower lip
    const ml = landmarks[61]; // Mouth left
    const mr = landmarks[291]; // Mouth right
    
    const vd = Math.hypot((ul.x - ll.x) * actualWidth, (ul.y - ll.y) * actualHeight);
    const hd = Math.hypot((ml.x - mr.x) * actualWidth, (ml.y - mr.y) * actualHeight) || 1e-6;
    const mouthOpenRatio = vd / hd;
    
    // Eye aspect ratio for blink detection
    const leftEAR = this.calculateEAR([33, 160, 158, 133, 153, 144], landmarks, actualWidth, actualHeight);
    const rightEAR = this.calculateEAR([362, 385, 387, 263, 373, 380], landmarks, actualWidth, actualHeight);
    const earAvg = (leftEAR + rightEAR) / 2;
    
    const eyesClosed = earAvg < this.blinkThreshold;
    const blink = this.prevEyesClosed[faceIndex] && !eyesClosed;
    this.prevEyesClosed[faceIndex] = eyesClosed;
    
    return {
      yaw,
      pitch,
      mouthOpenRatio,
      eyesClosed,
      blink,
      faceCoords: [fx, fy],
      landmarks
    };
  }
  
  private calculateEAR(indices: number[], landmarks: any[], width: number, height: number): number {
    const points = indices.map(i => landmarks[i]);
    
    const v1 = Math.hypot(
      (points[1].x - points[5].x) * width,
      (points[1].y - points[5].y) * height
    );
    const v2 = Math.hypot(
      (points[2].x - points[4].x) * width,
      (points[2].y - points[4].y) * height
    );
    const h = Math.hypot(
      (points[0].x - points[3].x) * width,
      (points[0].y - points[3].y) * height
    ) || 1e-6;
    
    return (v1 + v2) / (2 * h);
  }
  
  private checkEyeContact(detection: FaceDetection): boolean {
    if (!this.targetElement) return false;
    
    // Get target element position
    const targetRect = this.targetElement.getBoundingClientRect();
    const targetCenter = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2
    };
    
    // Convert face coordinates to screen coordinates
    // This is a simplified approach - you might need to adjust based on your video element positioning
    const videoRect = this.videoElement?.getBoundingClientRect();
    if (!videoRect) return false;
    
    const screenX = videoRect.left + (detection.faceCoords[0] / this.videoSize.width) * videoRect.width;
    const screenY = videoRect.top + (detection.faceCoords[1] / this.videoSize.height) * videoRect.height;
    
    // Calculate distance to target
    const distance = Math.sqrt(
      Math.pow(screenX - targetCenter.x, 2) + 
      Math.pow(screenY - targetCenter.y, 2)
    );
    
    // Check if looking at target (within threshold)
    const isLookingAt = distance < this.threshold;
    
    if (this.debug) {
      console.log(`Eye contact check: distance=${distance.toFixed(1)}, threshold=${this.threshold}, looking=${isLookingAt}`);
    }
    
    return isLookingAt;
  }
  
  // Add initCamera method
  private async initCamera(): Promise<void> {
    console.log('📹 Starting camera initialization...');
    
    // Get user media manually (like face-controls)
    const getUserMedia = (constraints: MediaStreamConstraints) => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('Using navigator.mediaDevices.getUserMedia');
        return navigator.mediaDevices.getUserMedia(constraints);
      }
      const legacy = (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia || (navigator as any).getUserMedia;
      if (legacy) {
        console.log('Using legacy getUserMedia');
        return new Promise<MediaStream>((resolve, reject) => {
          legacy.call(navigator, constraints, resolve, reject);
        });
      }
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    };

    try {
      console.log('🎥 Requesting camera access...');
      this.stream = await getUserMedia({
        video: {
          width: this.videoSize.width,
          height: this.videoSize.height,
          facingMode: 'user'
        }
      });
      console.log('✅ Camera access granted, stream:', this.stream);

      if (this.videoElement) {
        console.log('📺 Setting video source...');
        this.videoElement.srcObject = this.stream;
        
        await new Promise<void>((resolve) => {
          this.videoElement!.onloadedmetadata = () => {
            console.log('📊 Video metadata loaded:', {
              videoWidth: this.videoElement!.videoWidth,
              videoHeight: this.videoElement!.videoHeight,
              readyState: this.videoElement!.readyState
            });
            
            // Set canvas size to match video dimensions
            if (this.debug && this.canvasElement && this.videoElement) {
              const width = this.videoElement.videoWidth || this.videoSize.width;
              const height = this.videoElement.videoHeight || this.videoSize.height;
              this.canvasElement.width = width;
              this.canvasElement.height = height;
              console.log(`🎨 Canvas size set to ${width}x${height}`);
            }
            resolve();
          };
        });
        
        console.log('🎬 Starting frame processing loop...');
        // Start the frame processing loop
        this.processFrame();
      }
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      throw new Error(`Failed to access camera: ${error}`);
    }
  }

  private processFrame(): void {
    console.log('🎞️ processFrame called', {
      faceMesh: !!this.faceMesh,
      isTracking: this.isTracking,
      videoElement: !!this.videoElement,
      videoReady: this.videoElement?.readyState,
      isInitialized: this.isInitialized
    });
    
    // Always send frames to MediaPipe if we have the required components
    // The onResults callback will handle the tracking state check
    if (this.faceMesh && this.videoElement && this.videoElement.readyState >= 2) {
      console.log('📤 Sending frame to MediaPipe...');
      this.faceMesh.send({ image: this.videoElement });
    } else {
      console.log('⚠️ Skipping frame processing - missing requirements or video not ready');
    }
    
    // Continue the loop as long as we're initialized (don't depend on tracking state)
    if (this.isInitialized) {
      this.animationFrameId = requestAnimationFrame(() => this.processFrame());
    } else {
      console.log('⏹️ Stopping frame processing - not initialized');
    }
  }

  // Public getter methods
  getLastDetections(): FaceDetection[] {
    return this.lastDetections;
  }
  
  isReady(): boolean {
    return this.isInitialized && this.isTracking;
  }
}

// Create singleton instance
const mediaEyeTracker = new MediaPipeEyeTracker();

export default mediaEyeTracker;
