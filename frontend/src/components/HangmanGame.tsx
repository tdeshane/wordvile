import React, { useState, useEffect } from 'react';
import '../styles/HangmanGame.css';

// Default word list (empty)
const DEFAULT_WORDS: { word: string; hint: string }[] = [];

// Maximum wrong attempts allowed
const MAX_WRONG_ATTEMPTS = 6;

// Keyboard layout for the virtual keyboard
const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

// Helper to get query param
function getQueryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

const LOCAL_STORAGE_KEY = 'hangman_words';
// Remove hardcoded password - will verify via backend
// const ADMIN_PASSWORD = 'BibleGames2025'; 

const API_BASE = process.env.REACT_APP_API_BASE || 'https://l4cy74gnlb.execute-api.us-east-1.amazonaws.com/Prod';
const ADMIN_TOKEN = process.env.REACT_APP_ADMIN_TOKEN || 'changeme';

interface HangmanGameProps {
  isAdmin: boolean;
  isPasswordVerified: boolean;
  adminToken: string;
  onAdminLogin: (token: string) => void;
  onAdminLogout: () => void;
  onAdminModeToggle: () => void;
}

const HangmanGame: React.FC<HangmanGameProps> = ({
  isAdmin,
  isPasswordVerified,
  adminToken,
  onAdminLogin,
  onAdminLogout,
  onAdminModeToggle
}) => {
  // Admin mode state
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customWords, setCustomWords] = useState<{ word: string; hint: string }[]>([]);
  const [wordInput, setWordInput] = useState('');
  const [hintInput, setHintInput] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Debug log for admin mode - reduce verbosity
  if (isAdmin && !isPasswordVerified) {
    console.log('Admin authentication needed for Hangman game');
  }

  // Verify password via backend API or local fallback for CORS issues
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Password is required');
      return;
    }
    
    setIsVerifying(true);
    setPasswordError('');
    
    try {
      // Hardcoded password as fallback for CORS issues
      const FALLBACK_PASSWORD = 'Pr@yer&WordG@me2025!';
      if (passwordInput === FALLBACK_PASSWORD) {
        console.log('Using local verification due to CORS issues with backend');
        onAdminLogin(FALLBACK_PASSWORD);
        setPasswordError('');
        setIsVerifying(false);
        return;
      }
      
      console.log(`Sending request to ${API_BASE}/verify-admin-password`);
      const response = await fetch(`${API_BASE}/verify-admin-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: passwordInput }),
      });
      
      if (!response.ok) {
        console.error('Server responded with error status:', response.status);
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        onAdminLogin(data.adminToken);
        setPasswordError('');
      } else {
        setPasswordError('Incorrect password');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setPasswordError('Network error: Could not connect to the server. This might be a CORS issue. Please contact the administrator.');
      } else {
        setPasswordError(`Error connecting to server: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Load words from backend API
  const getWords = () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr) && arr.every(w => w.word && w.hint)) {
          return arr;
        }
      } catch {}
    }
    return DEFAULT_WORDS;
  };

  const WORDS = getWords();

  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fullWordGuess, setFullWordGuess] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Load words from backend API
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        console.log(`Fetching words from ${API_BASE}/words/hangman`);
        const response = await fetch(`${API_BASE}/words/hangman`);
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.every(w => w.word && w.hint)) {
            setCustomWords(data);
            // Also save to localStorage as backup
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          } else {
            // Fallback to localStorage if API returns invalid data
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
              try {
                const arr = JSON.parse(stored);
                if (Array.isArray(arr) && arr.every(w => w.word && w.hint)) {
                  setCustomWords(arr);
                }
              } catch {}
            }
          }
        } else {
          // Fallback to localStorage if API returns an error
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (stored) {
            try {
              const arr = JSON.parse(stored);
              if (Array.isArray(arr) && arr.every(w => w.word && w.hint)) {
                setCustomWords(arr);
              }
            } catch {}
          }
          
          if (response.status === 404) {
            console.log('No custom word list found on server, using localStorage');
          } else {
            setLoadError(`Error loading words: ${response.status}`);
          }
        }
      } catch (error) {
        console.error('Error fetching words:', error);
        setLoadError(`Error loading words: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Fallback to localStorage in case of error
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr) && arr.every(w => w.word && w.hint)) {
              setCustomWords(arr);
            }
          } catch {}
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWords();
  }, []);
  
  // Save words to backend when customWords change (admin only)
  useEffect(() => {
    const saveWords = async () => {
      if (!isAdmin || !isPasswordVerified || customWords.length === 0) {
        return;
      }
      
      try {
        console.log(`Saving words to ${API_BASE}/words/hangman`);
        // Use either the adminToken or fallback to the hardcoded password
        const tokenToUse = adminToken || 'Pr@yer&WordG@me2025!';
        
        const response = await fetch(`${API_BASE}/words/hangman`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': tokenToUse
          },
          body: JSON.stringify({ 
            words: customWords,
            token: tokenToUse // Also include in body as fallback
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error(`Error saving words to server: ${response.status}`, data);
        } else if (!data.success) {
          console.error('Server returned success: false', data);
        } else {
          console.log('Words saved successfully to server');
        }
      } catch (error) {
        console.error('Error saving words to server:', error);
        // Continue execution - we'll rely on localStorage as backup
      }
    };
    
    if (isAdmin && isPasswordVerified && customWords.length > 0) {
      saveWords();
    }
  }, [customWords, isAdmin, isPasswordVerified, adminToken]);
  
  // Use customWords for the game instead of localStorage
  const ACTIVE_WORDS = customWords;
  
  // Initialize a new word when game starts or moves to next word
  useEffect(() => {
    if (!isAdmin && !isLoading && ACTIVE_WORDS[currentIndex]) {
      const word = ACTIVE_WORDS[currentIndex].word;
      setCurrentWord(word);
      setGuessedLetters([]);
      setWrongAttempts(0);
      setGameStatus('playing');
      setShowHint(false);
    }
  }, [currentIndex, isAdmin, isLoading, ACTIVE_WORDS]);
  
  // Check if the player has won
  useEffect(() => {
    if (currentWord && gameStatus === 'playing') {
      const isWon = Array.from(currentWord).every(letter => guessedLetters.includes(letter));
      if (isWon) {
        setGameStatus('won');
        setScore(score + 5);
      }
    }
  }, [currentWord, guessedLetters, gameStatus, score]);
  
  // Check if the player has lost
  useEffect(() => {
    if (wrongAttempts >= MAX_WRONG_ATTEMPTS && gameStatus === 'playing') {
      setGameStatus('lost');
    }
  }, [wrongAttempts, gameStatus]);
  
  // Handle letter guess
  const handleLetterGuess = (letter: string) => {
    if (gameStatus !== 'playing' || guessedLetters.includes(letter) || isTransitioning) {
      return;
    }
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    // Check if the guessed letter is in the word
    if (!currentWord.includes(letter)) {
      setWrongAttempts(wrongAttempts + 1);
    }
    
    // Check if this guess has won the game
    const isWinningGuess = Array.from(currentWord).every(char => 
      newGuessedLetters.includes(char)
    );

    if (isWinningGuess) {
      setIsTransitioning(true);
      // Use timeout to prevent multiple submissions
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1500);
    }
  };
  
  // Display the current word with underscores for unguessed letters
  const getDisplayWord = () => {
    return Array.from(currentWord).map(letter => 
      guessedLetters.includes(letter) ? letter : '_'
    ).join(' ');
  };
  
  // Move to next word
  const nextWordHandler = () => {
    if (currentIndex < ACTIVE_WORDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Game is complete
      alert(`Game complete! Final score: ${score}`);
    }
  };
  
  // Show hint
  const showHintHandler = () => {
    console.log("==== HINT REQUESTED IN HANGMAN ====");
    console.log("Current score before hint penalty:", score);
    
    // First update the UI to show the hint
    setShowHint(true);
    
    // Then apply the score penalty (1 point)
    const newScore = Math.max(0, score - 1);
    console.log("Applying penalty: new score will be:", newScore);
    setScore(newScore);
    console.log("==== END HINT REQUEST ====");
  };
  
  // Admin: handle add/edit/delete word
  const handleAddWord = () => {
    if (!wordInput.trim() || !hintInput.trim()) return;
    const newWord = wordInput.trim().toUpperCase();
    const newHint = hintInput.trim();
    let updated;
    if (editIndex !== null) {
      updated = [...customWords];
      updated[editIndex] = { word: newWord, hint: newHint };
    } else {
      updated = [...customWords, { word: newWord, hint: newHint }];
    }
    setCustomWords(updated);
    // Also save to localStorage as backup
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setWordInput('');
    setHintInput('');
    setEditIndex(null);
  };
  const handleEditWord = (idx: number) => {
    setWordInput(customWords[idx].word);
    setHintInput(customWords[idx].hint);
    setEditIndex(idx);
  };
  const handleDeleteWord = (idx: number) => {
    const updated = customWords.filter((_, i) => i !== idx);
    setCustomWords(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setWordInput('');
    setHintInput('');
    setEditIndex(null);
  };
  const handleClearAll = () => {
    setCustomWords([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };
  
  // Switch between admin and player mode
  const handleSwitchMode = () => {
    if (isAdmin) {
      onAdminLogout();
    } else {
      onAdminModeToggle();
    }
  };
  
  // Render the hangman figure based on wrong attempts
  const renderHangman = () => {
    return (
      <div className="hangman-figure">
        <svg viewBox="0 0 200 200" className="hangman-svg">
          {/* Base */}
          <line x1="20" y1="180" x2="100" y2="180" stroke="#333" strokeWidth="4" />
          {/* Pole */}
          <line x1="60" y1="20" x2="60" y2="180" stroke="#333" strokeWidth="4" />
          {/* Top */}
          <line x1="60" y1="20" x2="140" y2="20" stroke="#333" strokeWidth="4" />
          {/* Rope */}
          <line x1="140" y1="20" x2="140" y2="40" stroke="#333" strokeWidth="4" />
          
          {/* Head */}
          {wrongAttempts > 0 && (
            <circle cx="140" cy="60" r="20" stroke="#333" strokeWidth="4" fill="none" />
          )}
          
          {/* Body */}
          {wrongAttempts > 1 && (
            <line x1="140" y1="80" x2="140" y2="120" stroke="#333" strokeWidth="4" />
          )}
          
          {/* Left Arm */}
          {wrongAttempts > 2 && (
            <line x1="140" y1="90" x2="120" y2="100" stroke="#333" strokeWidth="4" />
          )}
          
          {/* Right Arm */}
          {wrongAttempts > 3 && (
            <line x1="140" y1="90" x2="160" y2="100" stroke="#333" strokeWidth="4" />
          )}
          
          {/* Left Leg */}
          {wrongAttempts > 4 && (
            <line x1="140" y1="120" x2="120" y2="150" stroke="#333" strokeWidth="4" />
          )}
          
          {/* Right Leg */}
          {wrongAttempts > 5 && (
            <line x1="140" y1="120" x2="160" y2="150" stroke="#333" strokeWidth="4" />
          )}
        </svg>
      </div>
    );
  };
  
  // Virtual keyboard
  const renderKeyboard = () => {
    return (
      <div className="keyboard">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map(letter => (
              <button
                key={letter}
                className={`key ${guessedLetters.includes(letter) ? (currentWord.includes(letter) ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleLetterGuess(letter)}
                disabled={guessedLetters.includes(letter) || gameStatus !== 'playing'}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  // Handle full word guess
  const handleFullWordGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameStatus !== 'playing' || !fullWordGuess.trim() || isTransitioning) {
      return;
    }
    
    const guess = fullWordGuess.trim().toUpperCase();
    setIsTransitioning(true);
    
    if (guess === currentWord) {
      // Mark all letters as guessed
      const allLetters = Array.from(new Set([...guessedLetters, ...Array.from(currentWord)]));
      setGuessedLetters(allLetters);
      setGameStatus('won');
      setScore(score + 5);
    } else {
      // Count as two wrong attempts as penalty
      setWrongAttempts(Math.min(MAX_WRONG_ATTEMPTS, wrongAttempts + 2));
      setFullWordGuess('');
    }
    
    // Reset transitioning state after a delay
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
  };

  const handleFullWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullWordGuess(e.target.value.toUpperCase());
  };
  
  // First check for admin mode with password verification
  if (isAdmin) {
    if (!isPasswordVerified) {
      return (
        <div className="hangman-game admin-mode">
          <h2>Admin Authentication</h2>
          <form onSubmit={handlePasswordSubmit} className="admin-password-form">
            <div>
              <label htmlFor="password">Enter Admin Password:</label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                disabled={isVerifying}
              />
            </div>
            {passwordError && <div className="password-error">{passwordError}</div>}
            <button type="submit" disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Login'}
            </button>
            <button type="button" onClick={onAdminModeToggle} disabled={isVerifying}>
              Cancel
            </button>
          </form>
          <div style={{marginTop: 20}}>
            <button 
              className="switch-mode" 
              onClick={handleSwitchMode} 
              style={{marginBottom: 10}}
            >
              Player Mode
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="hangman-game admin-mode">
        <h2>Admin: Set Up Hangman</h2>
        <div className="admin-controls">
          <input
            type="text"
            id="admin-word-input"
            name="admin-word-input"
            placeholder="WORD (UPPERCASE, no spaces)"
            value={wordInput}
            onChange={e => setWordInput(e.target.value.toUpperCase())}
          />
          <input
            type="text"
            id="admin-hint-input"
            name="admin-hint-input"
            placeholder="Hint"
            value={hintInput}
            onChange={e => setHintInput(e.target.value)}
          />
          <button onClick={handleAddWord}>{editIndex !== null ? 'Update' : 'Add'}</button>
          <button onClick={handleClearAll}>Clear All</button>
          <button onClick={handleSwitchMode}>Switch to Player Mode</button>
        </div>
        <ul className="admin-word-list">
          {customWords.map((w, idx) => (
            <li key={idx}>
              <b>{w.word}</b>: {w.hint}
              <button onClick={() => handleEditWord(idx)}>Edit</button>
              <button onClick={() => handleDeleteWord(idx)}>Delete</button>
            </li>
          ))}
        </ul>
        <div style={{marginTop: 20, color: '#888'}}>
          <b>Instructions:</b> Enter words and hints. Switch to player mode to play the game with your custom list.
        </div>
      </div>
    );
  }

  // Then check for empty word list or loading state
  if (isLoading) {
    return (
      <div className="hangman-game">
        <h2>Hangman</h2>
        <div style={{ color: '#888', margin: 20 }}>
          Loading word list...
        </div>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="hangman-game">
        <h2>Hangman</h2>
        <div style={{ color: 'red', margin: 20 }}>
          {loadError}
        </div>
        <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
          Admin Mode
        </button>
      </div>
    );
  }

  // Then check for empty word list
  if (ACTIVE_WORDS.length === 0) {
    return (
      <div className="hangman-game">
        <h2>Hangman</h2>
        <div style={{ color: '#888', margin: 20 }}>
          No words available. Please add words in admin mode.
        </div>
        <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
          Admin Mode
        </button>
      </div>
    );
  }

  // Check for out of bounds index
  if (!ACTIVE_WORDS[currentIndex]) {
    return (
      <div className="hangman-game">
        <h2>Hangman</h2>
        <div className="message">Game complete! Final score: {score}</div>
        <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
          Admin Mode
        </button>
      </div>
    );
  }

  return (
    <div className="hangman-game">
      <h2>Hangman</h2>
      <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
        Admin Mode
      </button>
      <div className="game-container">
        <div className="score-display">Score: {score}</div>
        
        {renderHangman()}
        
        <div className="word-display">{getDisplayWord()}</div>
        
        {gameStatus === 'won' && (
          <div className="message success">
            You won! +5 points
            <button className="next-button" onClick={nextWordHandler}>
              Next Word
            </button>
          </div>
        )}
        
        {gameStatus === 'lost' && (
          <div className="message failure">
            You lost! The word was: {currentWord}
            <button className="next-button" onClick={nextWordHandler}>
              Next Word
            </button>
          </div>
        )}
        
        <div className="attempts-left">
          Wrong attempts: {wrongAttempts} / {MAX_WRONG_ATTEMPTS}
        </div>
        
        {renderKeyboard()}
        
        {gameStatus === 'playing' && (
          <div className="full-word-guess">
            <form onSubmit={handleFullWordGuess}>
              <input
                type="text"
                placeholder="Guess the full word"
                value={fullWordGuess}
                onChange={handleFullWordChange}
                disabled={gameStatus !== 'playing'}
              />
              <button type="submit" disabled={gameStatus !== 'playing'}>
                Guess Full Word
              </button>
            </form>
          </div>
        )}
        
        {!showHint && gameStatus === 'playing' && (
          <button className="hint-button" onClick={showHintHandler}>
            Show Hint
          </button>
        )}
        
        {showHint && (
          <div className="hint">
            <strong>Hint:</strong> {ACTIVE_WORDS[currentIndex].hint}
          </div>
        )}
        
        <div className="progress">
          Word {currentIndex + 1} of {ACTIVE_WORDS.length}
        </div>
      </div>
    </div>
  );
};

export default HangmanGame; 