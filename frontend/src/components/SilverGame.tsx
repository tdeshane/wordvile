import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/SilverGame.css';

interface Word {
  word: string;
  color: string;
  points: number; // In survival, these points are deducted from powerLevel
}

interface GameData {
  words: Word[];
}

// Define GameMode type
type GameMode = 'survival' | 'peaceful' | 'creative';

const SilverGame: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'round_over'>('playing');
  const [timeLeft, setTimeLeft] = useState(60);
  const [powerLevel, setPowerLevel] = useState(100);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('survival'); // Added gameMode state
  const [gameOverMessage, setGameOverMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  const fetchWords = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/words/silver`);
      setGameData(response.data);
      setWords(response.data.words.slice(0, 10)); // Initialize with a subset of words
    } catch (error) {
      console.error('Error fetching words:', error);
      setGameData({ words: [] }); // Ensure gameData is not null
      setWords([]);
    }
  }, [API_URL]);

  const resetGame = useCallback((newMode: GameMode) => {
    setGameMode(newMode);
    setScore(0);
    setGameState('playing');
    setPowerLevel(100);
    setTimeLeft(60); // Timer useEffect will handle creative mode
    fetchWords();
    setGameOverMessage('');
  }, [fetchWords]);

  useEffect(() => {
    resetGame('survival'); // Initial game mode
  }, [resetGame]); // Ensure resetGame is stable or correctly memoized

  // Timer effect
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    if (gameState === 'playing' && gameMode !== 'creative') {
      timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [gameState, gameMode]);

  const handleGameEnd = useCallback(() => {
    if (gameMode === 'survival') {
      if (powerLevel <= 0) {
        setGameState('won');
        setGameOverMessage('Victory! You survived the onslaught!');
      } else {
        setGameState('lost');
        setGameOverMessage('Game Over! Time ran out.');
      }
    } else if (gameMode === 'peaceful') {
      setGameState('round_over');
      setGameOverMessage('Round Complete! Time\'s up.');
    }
    // Creative mode does not end by timer
  }, [gameMode, powerLevel]);

  // timeLeft check effect
  useEffect(() => {
    if (timeLeft <= 0 && gameState === 'playing' && gameMode !== 'creative') {
      handleGameEnd();
    }
  }, [timeLeft, gameState, gameMode, handleGameEnd]);

  const checkWinCondition = useCallback(() => {
    if (gameState !== 'playing') return;

    if (gameMode === 'survival') {
      if (powerLevel <= 0) {
        setGameState('won');
        setGameOverMessage('Victory! You survived the onslaught!');
      } else if (words.length === 0 && gameData && gameData.words.every(w => !words.find(currentW => currentW.word === w.word))) {
        // This condition means no words on screen AND no more words available from gameData to add
        setGameState('lost');
        setGameOverMessage('Game Over! You ran out of words.');
      }
    } else if (gameMode === 'peaceful') {
      if (words.length === 0 && gameData && gameData.words.every(w => !words.find(currentW => currentW.word === w.word))) {
        setGameState('round_over');
        setGameOverMessage('Round Complete! All words cleared.');
      }
    }
    // Creative mode has no automatic win/loss condition here
  }, [gameState, gameMode, powerLevel, words, gameData]);

  const handleWordClick = (clickedWord: Word) => {
    if (gameState !== 'playing') return;

    setScore(prev => prev + clickedWord.points);

    if (gameMode === 'survival') {
      setPowerLevel(prev => Math.max(0, prev - clickedWord.points));
    }

    setWords(prevWords => {
      const newWords = prevWords.filter(w => w.word !== clickedWord.word);
      if (gameData && gameData.words.length > 0 && newWords.length < 10) {
        const availableWordsFromSource = gameData.words.filter(
          sourceWord => !newWords.some(currentWord => currentWord.word === sourceWord.word)
        );
        if (availableWordsFromSource.length > 0) {
          const nextWordIndex = Math.floor(Math.random() * availableWordsFromSource.length);
          newWords.push(availableWordsFromSource[nextWordIndex]);
        }
      }
      return newWords;
    });

    // checkWinCondition will be called in useEffect after words/powerLevel state updates
  };

  useEffect(() => {
    checkWinCondition();
  }, [words, powerLevel, checkWinCondition]); // checkWinCondition depends on gameState, gameMode, powerLevel, words, gameData


  return (
    <div className="silver-game-container">
      <div className="game-mode-selector" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button onClick={() => resetGame('survival')} disabled={gameMode === 'survival'}>Survival</button>
        <button onClick={() => resetGame('peaceful')} disabled={gameMode === 'peaceful'}>Peaceful</button>
        <button onClick={() => resetGame('creative')} disabled={gameMode === 'creative'}>Creative</button>
      </div>

      <div className="silver-game-header">
        <h2>Silver's Word Challenge - {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}</h2>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{score}</span>
          </div>
          {(gameMode !== 'creative') && (
            <div className="stat-item">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{timeLeft}s</span>
            </div>
          )}
          {(gameMode === 'survival') && (
            <div className="stat-item">
              <span className="stat-label">Power:</span>
              <span className={`stat-value ${powerLevel <= 20 ? 'low-power' : ''}`}>
                {powerLevel}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="game-board">
        {words.map((word, index) => (
          <div
            key={`${word.word}-${index}`}
            className="word-card"
            style={{ backgroundColor: word.color }}
            onClick={() => handleWordClick(word)}
          >
            {word.word}
          </div>
        ))}
      </div>

      {gameState !== 'playing' && (
        <div className="game-over">
          <h3>{gameOverMessage}</h3>
          <p>Final Score: {score}</p>
          <button onClick={() => resetGame(gameMode)}> {/* Reset to current mode */}
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SilverGame;
