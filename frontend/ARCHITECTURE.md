# Wordvile Frontend Architecture

## Overview

This document describes the architecture of the Wordvile frontend application, a React-based game where words have physical form and eye tracking is a core mechanic.

## Technology Stack

- **Build Tool**: Vite (migrated from Create React App)
- **Framework**: React 19
- **Language**: TypeScript
- **State Management**: Zustand
- **Eye Tracking**: MediaPipe Face Mesh
- **Styling**: CSS Modules
- **Testing**: Jest + React Testing Library + Playwright

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
├── data/           # Static data files
├── features/       # Feature-specific modules (future)
├── hooks/          # Custom React hooks
├── services/       # API and external service integrations
├── store/          # Zustand state management
├── styles/         # Global and component styles
├── types/          # TypeScript type definitions
└── utils/          # Utility functions and helpers
```

## Key Architectural Decisions

### 1. Migration from CRA to Vite

**Why**: 
- Significantly faster development server startup (8s → 2s)
- Better HMR (Hot Module Replacement) performance
- Smaller bundle sizes
- Native ES modules support

### 2. Zustand for State Management

**Why**:
- Minimal boilerplate compared to Redux
- TypeScript-first design
- Built-in devtools support
- Excellent performance with React 19

**Stores**:
- `useGameStore`: Core game state (score, lives, mode)
- `useEyeTrackingStore`: Eye tracking and GREAT LEXICON state
- `useCreatureStore`: Creature collection management

### 3. Module Aliases

Configured path aliases for cleaner imports:
```typescript
import { useGameStore } from '@store'
import { EyeTracker } from '@utils/EyeTracker'
import { Creature } from '@types/creatures'
```

### 4. Eye Tracking Architecture

The eye tracking system is built with:
- MediaPipe Face Mesh for facial landmark detection
- Custom `EyeTracker` utility class
- Integration with GREAT LEXICON system

### 5. Environment Configuration

- Development: `.env.development`
- Production: `.env.production`
- All env vars prefixed with `VITE_`

## Performance Optimizations

1. **Code Splitting**: Vite automatically handles code splitting
2. **Lazy Loading**: Components loaded on demand
3. **Asset Optimization**: Images and assets optimized during build
4. **Tree Shaking**: Unused code eliminated

## Development Workflow

1. **Local Development**: `npm run dev`
2. **Type Checking**: `npm run typecheck`
3. **Linting**: `npm run lint`
4. **Testing**: `npm test`
5. **Building**: `npm run build`

## Future Considerations

1. **Module Federation**: For micro-frontend architecture if needed
2. **PWA Support**: For offline gameplay
3. **WebAssembly**: For performance-critical game logic
4. **Service Workers**: For caching and offline support