import React, { useState, useEffect } from 'react';
import WordScrambleGame from './WordScrambleGame';
import HangmanGame from './HangmanGame';
import WordSearchGame from './WordSearchGame';
import SilverGame from './SilverGame';
import '../styles/TabsContainer.css';

// Helper to get query param
function getQueryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

type Tab = 'wordScramble' | 'hangman' | 'wordSearch' | 'silver';

const TabsContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('wordScramble');
  
  // Shared admin state
  const [isAdmin, setIsAdmin] = useState(getQueryParam('admin') === '1');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [adminToken, setAdminToken] = useState('');

  // Load admin state from localStorage on initial render
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedVerified = localStorage.getItem('adminVerified');
    
    if (isAdmin && savedToken && savedVerified === 'true') {
      setIsPasswordVerified(true);
      setAdminToken(savedToken);
    }
  }, [isAdmin]);

  // Save admin state to localStorage when it changes
  useEffect(() => {
    if (isPasswordVerified && adminToken) {
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('adminVerified', 'true');
    } else if (!isPasswordVerified) {
      localStorage.removeItem('adminVerified');
    }
  }, [isPasswordVerified, adminToken]);

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
  };

  // Handle admin login
  const handleAdminLogin = (token: string) => {
    setIsPasswordVerified(true);
    setAdminToken(token);
  };

  // Handle toggling admin mode
  const handleAdminModeToggle = () => {
    setIsAdmin(prevState => !prevState);
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    setIsPasswordVerified(false);
    setAdminToken('');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminVerified');
    // Remove page reload
    // window.location.search = '';
  };

  return (
    <div className="tabs-container">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'wordScramble' ? 'active' : ''}`}
          onClick={() => changeTab('wordScramble')}
        >
          Word Scramble
        </button>
        <button 
          className={`tab ${activeTab === 'hangman' ? 'active' : ''}`}
          onClick={() => changeTab('hangman')}
        >
          Hangman
        </button>
        <button 
          className={`tab ${activeTab === 'wordSearch' ? 'active' : ''}`}
          onClick={() => changeTab('wordSearch')}
        >
          Word Search
        </button>
        <button 
          className={`tab ${activeTab === 'silver' ? 'active' : ''}`}
          onClick={() => changeTab('silver')}
        >
          Silver's Challenge
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'wordScramble' && (
          <WordScrambleGame 
            isAdmin={isAdmin} 
            isPasswordVerified={isPasswordVerified} 
            adminToken={adminToken}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={handleAdminLogout}
            onAdminModeToggle={handleAdminModeToggle}
          />
        )}
        {activeTab === 'hangman' && (
          <HangmanGame 
            isAdmin={isAdmin} 
            isPasswordVerified={isPasswordVerified} 
            adminToken={adminToken}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={handleAdminLogout}
            onAdminModeToggle={handleAdminModeToggle}
          />
        )}
        {activeTab === 'wordSearch' && (
          <WordSearchGame 
            isAdmin={isAdmin} 
            isPasswordVerified={isPasswordVerified} 
            adminToken={adminToken}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={handleAdminLogout}
            onAdminModeToggle={handleAdminModeToggle}
          />
        )}
      </div>
    </div>
  );
};

export default TabsContainer; 