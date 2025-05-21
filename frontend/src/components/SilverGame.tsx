import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SilverGame.css';

interface Word {
  word: string;
  color: string;
  points: number;
}

interface GameData {
  words: Word[];
}

interface Word {
  word: string;
  points: number;
  color: string;
}

const SilverGame: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeLeft, setTimeLeft] = useState(60);
  const [powerLevel, setPowerLevel] = useState(100);
  const [gameData, setGameData] = useState<GameData | null>(null);

  useEffect(() => {
    fetchWords();
    startGameTimer();
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleGameEnd();
    }
  }, [timeLeft]);

  const fetchWords = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/words/silver`);
      setGameData(response.data);
      setWords(response.data.words);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  const startGameTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  };

  const handleWordClick = (word: Word) => {
    if (gameState !== 'playing') return;

    setScore(prev => prev + word.points);
    setPowerLevel(prev => Math.max(0, prev - word.points));
    
    // Remove the clicked word and get a new one from the game data
    setWords(prev => {
      const newWords = prev.filter(w => w !== word);
      if (newWords.length < 10 && gameData?.words.length) {
        const remainingWords = gameData.words.filter(w => !newWords.includes(w));
        if (remainingWords.length > 0) {
          const nextWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
          newWords.push(nextWord);
        }
      }
      return newWords;
    });

    checkWinCondition();
  };

  const checkWinCondition = () => {
    if (powerLevel <= 0) {
      setGameState('won');
    } else if (words.length === 0) {
      setGameState('lost');
    }
  };

  const handleGameEnd = () => {
    if (powerLevel <= 0) {
      setGameState('won');
    } else {
      setGameState('lost');
    }
  };

  return (
    <div className="silver-game-container">
      <div className="silver-game-header">
        <h2>Silver's Word Challenge</h2>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Power:</span>
            <span className={`stat-value ${powerLevel <= 20 ? 'low-power' : ''}`}>
              {powerLevel}
            </span>
          </div>
        </div>
      </div>

      <div className="game-board">
        {words.map((word, index) => (
          <div
            key={index}
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
          <h3>{gameState === 'won' ? 'Victory!' : 'Game Over'}</h3>
          <p>Final Score: {score}</p>
          <button onClick={() => window.location.reload()}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SilverGame;
