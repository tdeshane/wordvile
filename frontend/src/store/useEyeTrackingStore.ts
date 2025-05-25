import { create } from 'zustand'

interface EyeTrackingState {
  isTracking: boolean
  isEyesOnScreen: boolean
  lastEyePosition: { x: number; y: number } | null
  isGreatLexiconActive: boolean
  
  // Actions
  setTracking: (isTracking: boolean) => void
  updateEyePosition: (position: { x: number; y: number } | null) => void
  setEyesOnScreen: (onScreen: boolean) => void
  activateGreatLexicon: () => void
  deactivateGreatLexicon: () => void
}

export const useEyeTrackingStore = create<EyeTrackingState>((set) => ({
  isTracking: false,
  isEyesOnScreen: true,
  lastEyePosition: null,
  isGreatLexiconActive: false,

  setTracking: (isTracking) => set({ isTracking }),
  updateEyePosition: (position) => set({ lastEyePosition: position }),
  setEyesOnScreen: (onScreen) => set((state) => ({
    isEyesOnScreen: onScreen,
    isGreatLexiconActive: !onScreen
  })),
  activateGreatLexicon: () => set({ isGreatLexiconActive: true }),
  deactivateGreatLexicon: () => set({ isGreatLexiconActive: false })
}))