# Bible Word Game Backend

A tiny Express backend for sharing custom word lists across devices for the Bible Word Game suite.

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Set your admin token in a `.env` file:
   ```env
   ADMIN_TOKEN=changeme   # Change this to a strong secret!
   PORT=4000
   ```

3. Run the server:
   ```sh
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## API

### GET /words/:game
- Fetch the word list for a game (e.g., `wordsearch`, `scramble`, `hangman`).
- Example: `GET /words/wordsearch`

### POST /words/:game
- Update the word list for a game (admin only).
- Requires header: `x-admin-token: <your token>`
- Body: `{ "words": [ { "word": "...", "hint": "..." }, ... ] }`

## Data Storage
- Word lists are stored as JSON files in the `data/` directory (e.g., `data/wordsearch.json`).

---

**Security:**
- Change the `ADMIN_TOKEN` in production!
- Do not expose this backend to the public internet without proper security. 