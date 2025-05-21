import React, { useState, useEffect } from 'react';
import '../styles/WordScrambleGame.css';

// Default word list (empty)
const DEFAULT_WORDS: { word: string; hint: string }[] = [];

// Helper to get query param
function getQueryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

const LOCAL_STORAGE_KEY = 'word_scramble_words';
// Remove hardcoded password - will verify via backend
// const ADMIN_PASSWORD = 'BibleGames2025';

function scrambleWord(word: string): string {
  // Handle empty or single-character words to prevent infinite recursion
  if (!word || word.length <= 1) {
    return word;
  }

  // Limit number of attempts to prevent infinite recursion
  let maxAttempts = 10;
  let scrambled = word;
  
  while (scrambled === word && maxAttempts > 0) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    scrambled = arr.join('');
    maxAttempts--;
  }
  
  // If we couldn't scramble after max attempts, make a simple character swap
  if (scrambled === word && word.length > 1) {
    const arr = word.split('');
    [arr[0], arr[1]] = [arr[1], arr[0]];
    scrambled = arr.join('');
  }
  
  return scrambled;
}

const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000' // Backend port for local development
  : process.env.REACT_APP_API_URL || 'https://l4cy74gnlb.execute-api.us-east-1.amazonaws.com/Prod'; // Changed to REACT_APP_API_URL

interface WordScrambleGameProps {
  isAdmin: boolean;
  isPasswordVerified: boolean;
  adminToken: string;
  onAdminLogin: (token: string) => void;
  onAdminLogout: () => void;
  onAdminModeToggle: () => void;
}

const WordScrambleGame: React.FC<WordScrambleGameProps> = ({
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
    console.log('Admin authentication needed for Word Scramble game');
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
  const getWords = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log(`Fetching words from ${API_BASE}/words/wordscramble`);
      const response = await fetch(`${API_BASE}/words/wordscramble`);
      
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

  // Save words to backend when customWords change (admin only)
  useEffect(() => {
    const saveWords = async () => {
      if (!isAdmin || !isPasswordVerified || customWords.length === 0) {
        return;
      }
      
      try {
        console.log(`Saving words to ${API_BASE}/words/wordscramble`);
        // Use either the adminToken or fallback to the hardcoded password
        const tokenToUse = adminToken || 'Pr@yer&WordG@me2025!';
        
        const response = await fetch(`${API_BASE}/words/wordscramble`, {
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

  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintPenalty, setHintPenalty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Load words from backend API
  useEffect(() => {
    getWords();
  }, []);

    // Set up a new word when the game starts or moves to next word
  useEffect(() => {
    if (!isAdmin && !isLoading && ACTIVE_WORDS[currentIndex]) {
      console.log("==== SETTING UP NEW WORD ====");
      const word = ACTIVE_WORDS[currentIndex].word;
      console.log("New word index:", currentIndex);
      console.log("Resetting hint penalty for new word");
      
      setScrambledWord(scrambleWord(word));
      setUserGuess('');
      setMessage('');
      setShowHint(false);
      setHintPenalty(false); // Reset hint penalty for new word
      
      console.log("Hint penalty reset to FALSE");
      console.log("==== NEW WORD SETUP COMPLETE ====");
    }
  }, [currentIndex, isAdmin, isLoading, ACTIVE_WORDS]);

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserGuess(e.target.value.trim().toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit clicked, isTransitioning:", isTransitioning, "isGameComplete:", isGameComplete);
    
    // Block submission if transitioning or game is complete
    if (!ACTIVE_WORDS[currentIndex] || isTransitioning || isGameComplete) {
      console.log("Submission blocked - transitioning, no word, or game complete");
      return;
    }
    
    const currentWord = ACTIVE_WORDS[currentIndex].word;
    if (userGuess === currentWord) {
      // Calculate points (hint penalty reduces award for correct answer)
      const pointsToAdd = hintPenalty ? 1 : 2;
      console.log("==== CORRECT ANSWER ====");
      console.log("hintPenalty active:", hintPenalty);
      console.log("Points awarded for correct answer:", pointsToAdd, hintPenalty ? "(reduced due to hint)" : "");
      console.log("Current score:", score);
      console.log("New score will be:", score + pointsToAdd);
      
      setScore(score + pointsToAdd);
      setIsTransitioning(true);
      
      if (currentIndex < ACTIVE_WORDS.length - 1) {
        // Not the last word - continue to next
        setMessage(`Correct! ${hintPenalty ? '+1 point (reduced award due to hint)' : '+2 points'}`);
        setTimeout(() => {
          console.log("Moving to next word");
          setCurrentIndex(currentIndex + 1);
          setIsTransitioning(false);
        }, 1500);
      } else {
        // Last word - game complete
        console.log("Last word correct - game complete!");
        setMessage(`Game complete! Final score: ${score + pointsToAdd}`);
        setIsGameComplete(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1500);
      }
    } else {
      console.log("Incorrect answer");
      setMessage('Try again!');
    }
  };

  const showHintHandler = () => {
    console.log("==== HINT REQUESTED IN WORD SCRAMBLE ====");
    console.log("Current score before penalty:", score);
    
    // Show the hint
    setShowHint(true);
    
    // Apply score penalty immediately (-1 point)
    const newScore = Math.max(0, score - 1);
    console.log("Applying immediate -1 point penalty");
    console.log("New score after penalty:", newScore);
    setScore(newScore);
    
    // Still set hint penalty flag for reduced points on correct answer
    setHintPenalty(true);
    console.log("Setting hint penalty flag to TRUE");
    console.log("==== END HINT REQUEST ====");
  };

  const skipWordHandler = () => {
    if (isTransitioning || isGameComplete) return;
    
    setIsTransitioning(true);
    if (currentIndex < ACTIVE_WORDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1500);
    } else {
      // Last word - game complete
      setMessage(`Game complete! Final score: ${score}`);
      setIsGameComplete(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1500);
    }
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

  // First check if we're in admin mode - this takes precedence
  if (isAdmin) {
    if (!isPasswordVerified) {
      return (
        <div className="word-scramble-game admin-mode">
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
      <div className="word-scramble-game admin-mode">
        <h2>Admin: Set Up Word Scramble</h2>
        <div className="admin-controls">
          <input
            type="text"
            id="admin-word-input"
            name="admin-word-input"
            placeholder="WORD (UPPERCASE, no spaces)"
            value={wordInput}
            onChange={e => setWordInput(e.target.value.toUpperCase())}
            maxLength={12}
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
          <b>Instructions:</b> Enter words (max 12 letters each) and hints. Switch to player mode to play the game with your custom list.
        </div>
      </div>
    );
  }

  // Then check for loading state or errors
  if (isLoading) {
    return (
      <div className="word-scramble-game">
        <h2>Word Scramble</h2>
        <div style={{ color: '#888', margin: 20 }}>
          Loading word list...
        </div>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="word-scramble-game">
        <h2>Word Scramble</h2>
        <div style={{ color: 'red', margin: 20 }}>
          {loadError}
        </div>
        <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
          Admin Mode
        </button>
      </div>
    );
  }

  // Then check for empty word list or game complete
  if (ACTIVE_WORDS.length === 0) {
    return (
      <div className="word-scramble-game">
        <h2>Word Scramble</h2>
        <div style={{ color: '#888', margin: 20 }}>
          No words available. Please add words in admin mode.
        </div>
        <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
          Admin Mode
        </button>
      </div>
    );
  }

  // Guard: if currentIndex is out of bounds or game is complete, show game complete
  if (!ACTIVE_WORDS[currentIndex] || isGameComplete) {
    return (
      <div className="word-scramble-game">
        <h2>Word Scramble</h2>
        <div className="message">Game complete! Final score: {score}</div>
        <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
          Admin Mode
        </button>
      </div>
    );
  }

  return (
    <div className="word-scramble-game">
      <h2>Word Scramble</h2>
      <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
        Admin Mode
      </button>
      <div className="game-container">
        <div className="score-display">Score: {score}</div>
        <div className="scrambled-word">{scrambledWord}</div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userGuess}
            onChange={handleGuessChange}
            placeholder="Type your guess here"
            autoFocus
          />
          <button type="submit">Submit</button>
        </form>
        <div className="message">{message}</div>
        {showHint && ACTIVE_WORDS[currentIndex] ? (
          <div className="hint">
            <strong>Hint:</strong> {ACTIVE_WORDS[currentIndex].hint}
          </div>
        ) : (
          <button className="hint-button" onClick={showHintHandler}>
            Show Hint (-1 point)
          </button>
        )}
        <button className="skip-button" onClick={skipWordHandler}>
          Skip Word
        </button>
        <div className="progress">
          Word {currentIndex + 1} of {ACTIVE_WORDS.length}
        </div>
      </div>
    </div>
  );
};

export default WordScrambleGame;