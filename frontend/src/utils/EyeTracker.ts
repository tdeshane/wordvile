// Eye tracking utility for detecting user gaze and focus
// This will be used to enhance user interaction in the game

export interface EyeTrackingData {
  x: number;
  y: number;
  confidence: number;
  timestamp: number;
}

export class EyeTracker {
  private isTracking: boolean = false;
  private callbacks: ((data: EyeTrackingData) => void)[] = [];

  constructor() {
    // Initialize eye tracking when available
  }

  start(): void {
    this.isTracking = true;
    // TODO: Implement eye tracking initialization
  }

  stop(): void {
    this.isTracking = false;
    // TODO: Implement eye tracking cleanup
  }

  onUpdate(callback: (data: EyeTrackingData) => void): void {
    this.callbacks.push(callback);
  }

  isActive(): boolean {
    return this.isTracking;
  }
}

export default EyeTracker;