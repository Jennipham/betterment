import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/views/home';
import SignUp from './components/views/signUp';
import Login from './components/views/login';
import Welcome from './components/views/welcome';

function App() {

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signupSuccess" element={<Welcome />} />

        </Routes>
      </div>
    </Router>
  );
}


export default App;
