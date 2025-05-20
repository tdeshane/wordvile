import React from 'react';
import './App.css';
import TabsContainer from './components/TabsContainer';
import { SilverProvider } from './components/SilverContext';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Word Games Collection</h1>
        <p>Challenge yourself with fun word puzzles!</p>
      </header>
      <main>
        <SilverProvider>
          <TabsContainer />
        </SilverProvider>
      </main>
      <footer>
        <p>Created with ❤️ for word game enthusiasts</p>
      </footer>
    </div>
  );
}

export default App;
