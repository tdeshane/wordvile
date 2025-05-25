# Wordvile

A narrative-driven game where words have physical form and language shapes reality. Built with React, TypeScript, and eye-tracking technology.

## Game Features

- **Eye Tracking Integration**: Control the game with your eyes using MediaPipe Face Mesh
- **The GREAT LEXICON**: An omnipotent force that activates when you look away
- **Multiple Game Modes**: Survival, Peaceful, and Creative modes
- **Word-Based Combat**: Use verbs to attack, adjectives to modify, and nouns as tools
- **Narrative Transportation**: Navigate through story spaces
- **Creature Collection**: Befriend and collect linguistic creatures

## How to Play

1. Enable camera access for eye tracking
2. Look at different parts of the screen to control your character
3. Collect words to build your linguistic arsenal
4. Defeat corrupted language entities
5. Progress through narrative layers
6. Keep your eyes on screen - looking away activates the GREAT LEXICON

## Getting Started

### Prerequisites

- Node.js and npm installed on your computer

### Installation

1. Clone this repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and visit http://localhost:3000

## Built With

- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Zustand** - Lightweight state management
- **MediaPipe** - Advanced eye tracking
- **Playwright** - E2E testing

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical architecture.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run TypeScript type checking
- `npm test` - Run unit tests
- `npm run test:playwright` - Run E2E tests

## Environment Variables

- `VITE_API_URL` - Backend API endpoint
- `VITE_APP_ENV` - Environment (development/production)

## Contributing

See [START_HERE.md](./START_HERE.md) for development guidelines.
