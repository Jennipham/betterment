import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/views/home';
import SignUp from './components/views/signUp';
import Login from './components/views/login';
import Welcome from './components/views/welcome';
import TermsOfUse from './components/views/termsOfUse';
import MentorProfile from './components/views/mentorProfile';
import MenteeProfile from './components/views/menteeProfile';
import ManagerProfile from './components/views/managerProfile';
import Profile from './components/views/profileSettings';
import Help from './components/views/help';
import AdminSettings from './components/views/adminSettings';


function App() {

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signupSuccess" element={<Welcome />} />
          <Route path="/termsofuse" element={<TermsOfUse />} />
          <Route path="/help" element={<Help />} />

          <Route path="/profileSettings" element={<Profile />} />
          <Route path="/adminSettings" element={<AdminSettings />} />

          <Route path="/mentorprofile" element={<MentorProfile />} />
          <Route path="/menteeprofile" element={<MenteeProfile />} />
          <Route path="/managerprofile" element={<ManagerProfile />} />

        </Routes>
      </div>
    </Router>
  );
}


export default App;
