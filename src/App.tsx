import React from 'react';
import './App.css';
import Testing from "./components/Testing";
import SignUp from "./components/SignUp";
import Header from "./components/Header";
import {Route, Routes, BrowserRouter as Router} from "react-router-dom";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Settings from "./components/Settings";

function App() {
  return (
      <Router>
          <div className="App">
              <header className="App-header">
                  <Header/>
              </header>
          </div>
          <Routes>
              <Route path="/" element={<Testing incoming={"Testing Props"}/>}></Route>
              <Route path="/SignUp" element={<SignUp></SignUp>}></Route>
              <Route path="/Login" element={<Login></Login>}></Route>
              <Route path="/Profile" element={<Profile></Profile>}></Route>
              <Route path="/Settings" element={<Settings></Settings>}></Route>
          </Routes>
      </Router>
  );
}

export default App;
