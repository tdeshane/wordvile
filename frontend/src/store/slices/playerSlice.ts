import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PlayerStats {
  level: number
  experience: number
  experienceToNext: number
  health: number
  maxHealth: number
  energy: number
  maxEnergy: number
  wordsCollected: number
  battlesWon: number
  battlesLost: number
  playTime: number // in seconds
}

export interface PlayerProgress {
  currentChapter: number
  currentQuest: string | null
  completedQuests: string[]
  unlockedAreas: string[]
  discoveredWords: string[]
  gameMode: 'survival' | 'peaceful' | 'creative'
  difficulty: 'easy' | 'normal' | 'hard'
}

interface PlayerState {
  // Player info
  playerId: string
  playerName: string
  createdAt: Date
  lastPlayed: Date
  
  // Stats
  stats: PlayerStats
  
  // Progress
  progress: PlayerProgress
  
  // Actions
  updateStats: (stats: Partial<PlayerStats>) => void
  updateProgress: (progress: Partial<PlayerProgress>) => void
  addExperience: (amount: number) => void
  levelUp: () => void
  collectWord: (word: string) => void
  completeQuest: (questId: string) => void
  unlockArea: (areaId: string) => void
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  useEnergy: (amount: number) => void
  restoreEnergy: (amount: number) => void
  updatePlayTime: (seconds: number) => void
  resetPlayer: () => void
}

const defaultStats: PlayerStats = {
  level: 1,
  experience: 0,
  experienceToNext: 100,
  health: 100,
  maxHealth: 100,
  energy: 50,
  maxEnergy: 50,
  wordsCollected: 0,
  battlesWon: 0,
  battlesLost: 0,
  playTime: 0
}

const defaultProgress: PlayerProgress = {
  currentChapter: 1,
  currentQuest: null,
  completedQuests: [],
  unlockedAreas: ['void-temple'],
  discoveredWords: [],
  gameMode: 'survival',
  difficulty: 'normal'
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      playerId: '',
      playerName: 'Anonymous Scholar',
      createdAt: new Date(),
      lastPlayed: new Date(),
      stats: defaultStats,
      progress: defaultProgress,
      
      // Actions
      updateStats: (newStats) => 
        set((state) => ({
          stats: { ...state.stats, ...newStats }
        })),
        
      updateProgress: (newProgress) =>
        set((state) => ({
          progress: { ...state.progress, ...newProgress }
        })),
        
      addExperience: (amount) => {
        const state = get()
        let newExp = state.stats.experience + amount
        let newLevel = state.stats.level
        let expToNext = state.stats.experienceToNext
        
        // Check for level up
        while (newExp >= expToNext) {
          newExp -= expToNext
          newLevel++
          expToNext = newLevel * 100 // Simple progression
          
          // Level up bonuses
          set((state) => ({
            stats: {
              ...state.stats,
              level: newLevel,
              experience: newExp,
              experienceToNext: expToNext,
              maxHealth: state.stats.maxHealth + 10,
              maxEnergy: state.stats.maxEnergy + 5,
              health: state.stats.maxHealth + 10, // Full heal on level up
              energy: state.stats.maxEnergy + 5
            }
          }))
        }
        
        // Update remaining experience
        set((state) => ({
          stats: {
            ...state.stats,
            experience: newExp
          }
        }))
      },
      
      levelUp: () => {
        const state = get()
        state.addExperience(state.stats.experienceToNext - state.stats.experience)
      },
      
      collectWord: (word) =>
        set((state) => ({
          stats: {
            ...state.stats,
            wordsCollected: state.stats.wordsCollected + 1
          },
          progress: {
            ...state.progress,
            discoveredWords: [...new Set([...state.progress.discoveredWords, word])]
          }
        })),
        
      completeQuest: (questId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            completedQuests: [...new Set([...state.progress.completedQuests, questId])],
            currentQuest: state.progress.currentQuest === questId ? null : state.progress.currentQuest
          }
        })),
        
      unlockArea: (areaId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            unlockedAreas: [...new Set([...state.progress.unlockedAreas, areaId])]
          }
        })),
        
      takeDamage: (amount) =>
        set((state) => ({
          stats: {
            ...state.stats,
            health: Math.max(0, state.stats.health - amount)
          }
        })),
        
      heal: (amount) =>
        set((state) => ({
          stats: {
            ...state.stats,
            health: Math.min(state.stats.maxHealth, state.stats.health + amount)
          }
        })),
        
      useEnergy: (amount) =>
        set((state) => ({
          stats: {
            ...state.stats,
            energy: Math.max(0, state.stats.energy - amount)
          }
        })),
        
      restoreEnergy: (amount) =>
        set((state) => ({
          stats: {
            ...state.stats,
            energy: Math.min(state.stats.maxEnergy, state.stats.energy + amount)
          }
        })),
        
      updatePlayTime: (seconds) =>
        set((state) => ({
          stats: {
            ...state.stats,
            playTime: state.stats.playTime + seconds
          },
          lastPlayed: new Date()
        })),
        
      resetPlayer: () =>
        set({
          stats: defaultStats,
          progress: defaultProgress,
          createdAt: new Date(),
          lastPlayed: new Date()
        })
    }),
    {
      name: 'wordvile-player-storage',
      partialize: (state) => ({
        playerId: state.playerId,
        playerName: state.playerName,
        createdAt: state.createdAt,
        lastPlayed: state.lastPlayed,
        stats: state.stats,
        progress: state.progress
      })
    }
  )
)