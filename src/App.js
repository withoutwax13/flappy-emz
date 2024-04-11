import React from 'react';
import './App.css';
import Game from './Game';

function App() {
  return (
    <div className="App">
      <header>
        <h1>FLAPPY EMZ</h1>
        <p>Use SPACE to play.</p>
      </header>
      <Game />
    </div>
  );
}

export default App;