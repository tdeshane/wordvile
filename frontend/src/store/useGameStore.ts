import { create } from 'zustand'

interface GameState {
  currentChallenge: string | null
  score: number
  lives: number
  gameMode: 'survival' | 'peaceful' | 'creative'
  isPlaying: boolean
  isPaused: boolean
  
  // Actions
  setCurrentChallenge: (challenge: string | null) => void
  updateScore: (points: number) => void
  updateLives: (lives: number) => void
  setGameMode: (mode: 'survival' | 'peaceful' | 'creative') => void
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState>((set) => ({
  currentChallenge: null,
  score: 0,
  lives: 3,
  gameMode: 'survival',
  isPlaying: false,
  isPaused: false,

  setCurrentChallenge: (challenge) => set({ currentChallenge: challenge }),
  updateScore: (points) => set((state) => ({ score: state.score + points })),
  updateLives: (lives) => set({ lives }),
  setGameMode: (mode) => set({ gameMode: mode }),
  startGame: () => set({ isPlaying: true, isPaused: false }),
  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),
  endGame: () => set({ isPlaying: false, isPaused: false }),
  resetGame: () => set({
    currentChallenge: null,
    score: 0,
    lives: 3,
    isPlaying: false,
    isPaused: false
  })
}))