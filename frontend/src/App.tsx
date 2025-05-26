import React, { useState, useEffect } from 'react';
import './App.css';
import TabsContainer from './components/TabsContainer';
import { SilverProvider } from './components/SilverContext';
import EyeTrackingCalibration from './components/EyeTrackingCalibration';
import GreatLexicon from './components/GreatLexicon';
import { useEyeTrackingStore } from '@store/useEyeTrackingStore';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationCompleted, setCalibrationCompleted] = useState(false);
  
  useEffect(() => {
    // Check if user has calibrated before (could be stored in localStorage)
    const hasCalibrated = localStorage.getItem('eyeTrackingCalibrated');
    if (!hasCalibrated) {
      setShowCalibration(true);
    } else {
      setCalibrationCompleted(true);
    }
  }, []);
  
  const handleCalibrationComplete = () => {
    localStorage.setItem('eyeTrackingCalibrated', 'true');
    setCalibrationCompleted(true);
    setShowCalibration(false);
  };
  
  const handleCalibrationSkip = () => {
    setCalibrationCompleted(true);
    setShowCalibration(false);
  };
  
  return (
    <div className="App">
      {/* GREAT LEXICON overlay - always rendered when active */}
      <GreatLexicon />
      
      {/* Eye tracking calibration */}
      {showCalibration && (
        <EyeTrackingCalibration 
          onComplete={handleCalibrationComplete}
          onSkip={handleCalibrationSkip}
        />
      )}
      
      {/* Main app content */}
      {!showCalibration && (
        <>
          <header className="App-header">
            <h1>Word Games Collection</h1>
            <p>Challenge yourself with fun word puzzles!</p>
          </header>
          <main id="game-viewport">
            <ErrorBoundary>
              <SilverProvider>
                <TabsContainer />
              </SilverProvider>
            </ErrorBoundary>
          </main>
          <footer>
            <p>Created with ❤️ for word game enthusiasts</p>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
