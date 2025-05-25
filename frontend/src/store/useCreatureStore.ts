import { create } from 'zustand'
import { Creature } from '../types/creatures'

interface CreatureState {
  creatures: Creature[]
  selectedCreature: Creature | null
  unlockedCreatures: string[]
  
  // Actions
  addCreature: (creature: Creature) => void
  selectCreature: (creature: Creature | null) => void
  unlockCreature: (creatureId: string) => void
  updateCreature: (id: string, updates: Partial<Creature>) => void
  resetCreatures: () => void
}

export const useCreatureStore = create<CreatureState>((set) => ({
  creatures: [],
  selectedCreature: null,
  unlockedCreatures: [],

  addCreature: (creature) => set((state) => ({
    creatures: [...state.creatures, creature]
  })),
  
  selectCreature: (creature) => set({ selectedCreature: creature }),
  
  unlockCreature: (creatureId) => set((state) => ({
    unlockedCreatures: [...state.unlockedCreatures, creatureId]
  })),
  
  updateCreature: (id, updates) => set((state) => ({
    creatures: state.creatures.map(c => 
      c.id === id ? { ...c, ...updates } : c
    )
  })),
  
  resetCreatures: () => set({
    creatures: [],
    selectedCreature: null,
    unlockedCreatures: []
  })
}))