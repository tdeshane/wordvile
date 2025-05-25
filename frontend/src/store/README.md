# Wordvile State Management

This directory contains all Zustand stores for managing global application state.

## Stores

### useGameStore
- Manages overall game state including score, lives, and game mode
- Handles game flow (start, pause, end, reset)
- Tracks current challenge

### useEyeTrackingStore
- Manages eye tracking state and the GREAT LEXICON system
- Tracks whether eyes are on screen
- Activates/deactivates GREAT LEXICON when eyes leave camera view

### useCreatureStore
- Manages creature collection and selection
- Tracks unlocked creatures
- Handles creature updates and state

## Usage

```typescript
import { useGameStore, useEyeTrackingStore } from '@store'

function GameComponent() {
  const score = useGameStore(state => state.score)
  const isGreatLexiconActive = useEyeTrackingStore(state => state.isGreatLexiconActive)
  
  // Use actions
  const updateScore = useGameStore(state => state.updateScore)
  updateScore(100)
}
```

## Best Practices

1. Use selectors to minimize re-renders
2. Keep stores focused on specific domains
3. Use TypeScript for type safety
4. Document complex state logic