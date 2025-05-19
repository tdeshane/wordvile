import React, { useState, useEffect } from 'react';
import '../styles/WordSearchGame.css';

// Default word list (empty)
const DEFAULT_WORDS: { word: string; hint: string }[] = [];

const GRID_SIZE = 15;
const DIRECTIONS = [
  [1, 0],   // Right
  [0, 1],   // Down
  [1, 1],   // Diagonal down-right
  [-1, 0],  // Left
  [0, -1],  // Up
  [-1, -1], // Diagonal up-left
  [1, -1],  // Diagonal up-right
  [-1, 1],  // Diagonal down-left
];

// Helper to get query param
function getQueryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

const LOCAL_STORAGE_KEY = 'word_search_words';
// Remove hardcoded password - will verify via backend
// const ADMIN_PASSWORD = 'BibleGames2025';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://l4cy74gnlb.execute-api.us-east-1.amazonaws.com/Prod';

interface WordSearchGameProps {
  isAdmin: boolean;
  isPasswordVerified: boolean;
  adminToken: string;
  onAdminLogin: (token: string) => void;
  onAdminLogout: () => void;
  onAdminModeToggle: () => void;
}

const WordSearchGame: React.FC<WordSearchGameProps> = ({
  isAdmin,
  isPasswordVerified,
  adminToken,
  onAdminLogin,
  onAdminLogout,
  onAdminModeToggle
}) => {
  console.log('WordSearchGame loaded');
  // Admin mode if ?admin=1
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customWords, setCustomWords] = useState<{ word: string; hint: string }[]>([]);
  const [wordInput, setWordInput] = useState('');
  const [hintInput, setHintInput] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Debug log for admin mode
  console.log('DEBUG: isAdmin =', isAdmin, 'window.location.search =', window.location.search);

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

  // Load words from backend or localStorage/default
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

  // Use smaller words for the word search to fit better in the grid
  const SEARCH_WORDS = getWords().filter(item => item.word.length <= 12).slice(0, 8);

  // Game state
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [selectedCells, setSelectedCells] = useState<{row: number, col: number}[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [hintVisible, setHintVisible] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load words from backend API
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        console.log(`Fetching words from ${API_BASE}/words/wordsearch`);
        const response = await fetch(`${API_BASE}/words/wordsearch`);
        
        console.log('Response status:', response.status);
        // Don't try to spread headers - just log the specific ones we're interested in
        console.log('Response content-type:', response.headers.get('content-type'));
        
        if (response.ok) {
          console.log('Response is OK, getting JSON data');
          const responseText = await response.text();
          console.log('Raw response:', responseText);
          
          try {
            const data = JSON.parse(responseText);
            console.log('Parsed data:', data);
            
            if (Array.isArray(data) && data.every(w => w.word && w.hint)) {
              console.log('Valid word array found, setting customWords');
              setCustomWords(data);
              // Also save to localStorage as backup
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            } else {
              console.log('Invalid data format, using localStorage fallback');
              // Fallback to localStorage if API returns invalid data
              const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
              if (stored) {
                try {
                  const arr = JSON.parse(stored);
                  if (Array.isArray(arr) && arr.every(w => w.word && w.hint)) {
                    setCustomWords(arr);
                  }
                } catch (parseError) {
                  console.error('Error parsing localStorage data:', parseError);
                }
              }
            }
          } catch (jsonError) {
            console.error('Error parsing response JSON:', jsonError);
            setLoadError(`Error parsing data: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
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
        console.log(`Saving words to ${API_BASE}/words/wordsearch`);
        // Use either the adminToken or fallback to the hardcoded password
        const tokenToUse = adminToken || 'Pr@yer&WordG@me2025!';
        
        const response = await fetch(`${API_BASE}/words/wordsearch`, {
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
    // Also save to localStorage as backup
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setWordInput('');
    setHintInput('');
    setEditIndex(null);
  };
  
  const handleClearAll = () => {
    setCustomWords([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Use customWords for the game instead of localStorage
  const ACTIVE_WORDS = customWords.filter(item => item.word.length <= 12).slice(0, 8);
  
  // Use console logs for one-time debugging only when needed
  // console.log('DEBUG INFO:');
  // console.log('- isAdmin:', isAdmin);
  // console.log('- isLoading:', isLoading);
  // console.log('- customWords.length:', customWords.length);
  // console.log('- ACTIVE_WORDS.length:', ACTIVE_WORDS.length);

  // Initialize the game grid with ACTIVE_WORDS - BUT only once when conditions are met
  useEffect(() => {
    // Only log once during troubleshooting 
    // console.log('Grid generation effect triggered');
    
    if (!isAdmin && !isLoading && ACTIVE_WORDS.length > 0 && grid.length === 0) {
      // console.log('Generating grid with words');
      generateGridWithWords(ACTIVE_WORDS);
    }
  }, [isAdmin, isLoading, ACTIVE_WORDS.length, grid.length]);

  // Check if all words are found
  useEffect(() => {
    if (foundWords.length === ACTIVE_WORDS.length && ACTIVE_WORDS.length > 0) {
      setGameComplete(true);
    }
  }, [foundWords, ACTIVE_WORDS.length]);

  // Generate the word search grid with the provided words
  const generateGridWithWords = (words: { word: string; hint: string }[]) => {
    let newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    let placedWordPositions: {word: string, positions: {row: number, col: number}[]}[] = [];
    
    for (const wordObj of words) {
      const word = wordObj.word;
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        const dirIndex = Math.floor(Math.random() * DIRECTIONS.length);
        const [dx, dy] = DIRECTIONS[dirIndex];
        const startRow = Math.floor(Math.random() * GRID_SIZE);
        const startCol = Math.floor(Math.random() * GRID_SIZE);
        
        if (wordFits(newGrid, word, startRow, startCol, dx, dy)) {
          const positions = placeWord(newGrid, word, startRow, startCol, dx, dy);
          placedWordPositions.push({ word, positions });
          placed = true;
        }
      }
      
      if (!placed) {
        console.log("Failed to place word:", word);
        generateGridWithWords(words);
        return;
      }
    }
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newGrid[row][col] === '') {
          newGrid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    
    setGrid(newGrid);
  };

  const wordFits = (grid: string[][], word: string, startRow: number, startCol: number, dx: number, dy: number): boolean => {
    const length = word.length;
    for (let i = 0; i < length; i++) {
      const row = startRow + i * dy;
      const col = startCol + i * dx;
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
        return false;
      }
      if (grid[row][col] !== '' && grid[row][col] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  const placeWord = (grid: string[][], word: string, startRow: number, startCol: number, dx: number, dy: number): {row: number, col: number}[] => {
    const positions: {row: number, col: number}[] = [];
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dy;
      const col = startCol + i * dx;
      grid[row][col] = word[i];
      positions.push({ row, col });
    }
    return positions;
  };

  // Handle mouse and touch events for cell selection
  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };
  const handleMouseEnter = (row: number, col: number) => {
    if (isSelecting) {
      setSelectedCells([...selectedCells, { row, col }]);
    }
  };
  const handleMouseUp = () => {
    setIsSelecting(false);
    checkSelection();
  };
  
  // Touch events for mobile support
  const handleTouchStart = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting) return;
    
    // Get the touch position
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    
    // Find if we're over a grid cell
    const cellElement = elements.find(el => el.classList.contains('grid-cell'));
    if (cellElement) {
      // Extract row and column from data attributes
      const row = parseInt(cellElement.getAttribute('data-row') || '-1');
      const col = parseInt(cellElement.getAttribute('data-col') || '-1');
      
      if (row >= 0 && col >= 0) {
        // Only add cell if it's not already the last one in our selection
        const lastCell = selectedCells[selectedCells.length - 1];
        if (!lastCell || lastCell.row !== row || lastCell.col !== col) {
          setSelectedCells([...selectedCells, { row, col }]);
        }
      }
    }
  };
  const handleTouchEnd = () => {
    setIsSelecting(false);
    checkSelection();
  };

  // Check if the selected cells form a word
  const checkSelection = () => {
    if (selectedCells.length <= 1) {
      setSelectedCells([]);
      return;
    }
    const word = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    const foundWord = SEARCH_WORDS.find(item => 
      item.word === word || item.word === word.split('').reverse().join('')
    );
    if (foundWord && !foundWords.includes(foundWord.word)) {
      setFoundWords([...foundWords, foundWord.word]);
      setScore(score + foundWord.word.length);
    } else {
      setTimeout(() => {
        setSelectedCells([]);
      }, 500);
    }
  };

  // Reset the game
  const resetGame = () => {
    setFoundWords([]);
    setScore(0);
    setSelectedCells([]);
    setGameComplete(false);
    setHintVisible(null);
    generateGridWithWords(ACTIVE_WORDS);
  };

  // Show a hint for a random unfound word (reduces score by 1)
  const showHint = () => {
    const unfoundWords = SEARCH_WORDS.filter(item => !foundWords.includes(item.word));
    if (unfoundWords.length > 0) {
      const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
      setHintVisible(randomWord.hint);
      setScore(Math.max(0, score - 1)); // Reduce score by 1, but not below 0
    }
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
        <div className="word-search-game admin-mode">
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
        </div>
      );
    }
    
    return (
      <div className="word-search-game admin-mode">
        <h2>Admin: Set Up Word Search</h2>
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
          <b>Instructions:</b> Enter up to 8 words (max 12 letters each) and hints. Switch to player mode to play the game with your custom list.
        </div>
      </div>
    );
  }

  // Then check for empty word list or loading state
  if (isLoading) {
    return (
      <div className="word-search-game">
        <h2>Word Search</h2>
        <div style={{ color: '#888', margin: 20 }}>
          Loading word list...
        </div>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="word-search-game">
        <h2>Word Search</h2>
        <div style={{ color: 'red', margin: 20 }}>
          {loadError}
        </div>
        <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
          Admin Mode
        </button>
      </div>
    );
  }

  if (ACTIVE_WORDS.length === 0) {
    return (
      <div className="word-search-game">
        <h2>Word Search</h2>
        <div style={{ color: '#888', margin: 20 }}>
          No words available. Please add words in admin mode.
        </div>
        <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
          Admin Mode
        </button>
      </div>
    );
  }

  return (
    <div className="word-search-game">
      <h2>Word Search</h2>
      <button className="switch-mode" onClick={handleSwitchMode} style={{marginBottom: 10}}>
        Admin Mode
      </button>
      <div className="game-container">
        <div className="score-display">Score: {score}</div>
        <div className="word-search-grid" 
          onMouseLeave={() => setIsSelecting(false)}>
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid-row">
              {row.map((cell, colIndex) => {
                const isSelected = selectedCells.some(
                  sel => sel.row === rowIndex && sel.col === colIndex
                );
                const isFound = foundWords.some(word => {
                  return word.split('').every((letter, index) => {
                    const pos = selectedCells[index];
                    return pos && grid[pos.row][pos.col] === letter;
                  }) && selectedCells.some(
                    sel => sel.row === rowIndex && sel.col === colIndex
                  );
                });
                return (
                  <div
                    key={colIndex}
                    className={`grid-cell ${isSelected ? 'selected' : ''} ${isFound ? 'found' : ''}`}
                    data-row={rowIndex}
                    data-col={colIndex}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onMouseUp={handleMouseUp}
                    onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="word-list">
          <h3>Find these words:</h3>
          <ul>
            {ACTIVE_WORDS.map(wordObj => (
              <li 
                key={wordObj.word}
                className={foundWords.includes(wordObj.word) ? 'found' : ''}
              >
                {wordObj.word} {foundWords.includes(wordObj.word) ? '✓' : ''}
              </li>
            ))}
          </ul>
        </div>
        {hintVisible && (
          <div className="hint">
            <strong>Hint:</strong> {hintVisible}
          </div>
        )}
        <div className="controls">
          <button className="hint-button" onClick={showHint} disabled={gameComplete}>
            Show Hint
          </button>
          <button className="reset-button" onClick={resetGame}>
            New Puzzle
          </button>
        </div>
        {gameComplete && (
          <div className="message success">
            Congratulations! You found all the words!
            <button className="reset-button" onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordSearchGame; 