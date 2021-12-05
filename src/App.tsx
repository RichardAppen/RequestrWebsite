import React from 'react';
import './App.css';
import Testing from "./components/Testing";
import Header from "./components/Header";

function App() {
  return (
    <div className="App">
        <header className="App-header">
            <Header/>
        </header>
        <Testing incoming={"Testing Props"}/>
    </div>
  );
}

export default App;
