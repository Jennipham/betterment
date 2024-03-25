import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/views/utilities/home';
import SignUp from './components/views/authentication/signUp';
import Login from './components/views/authentication/login';
import Welcome from './components/views/utilities/welcome';
import TermsOfUse from './components/views/utilities/termsOfUse';
import MenteeMatches from './components/views/matching/menteeMatches';
import Profile from './components/views/profiles/profileSettings';
import FullProfile from './components/views/profiles/fullViewProfile';
import Help from './components/views/utilities/help';
import AdminSettings from './components/views/profiles/adminSettings';
import MentorMatches from './components/views/matching/mentorMatches';
import NoPermissions from './components/views/authentication/noPermissions';
import Requests from './components/views/matching/requests';
import ProtectedRoute from './components/utils/protectedRoute';
import ExpiredSession from './components/views/authentication/expiredSession';
import Dashboard from './components/views/dashboard/dashboard';


function App() {

  

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signupSuccess" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/termsofuse" element={<TermsOfUse />} />
          <Route path="/fullprofile/:email" element={<ProtectedRoute><FullProfile/></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
          <Route path="/error" element={<NoPermissions />} />
          <Route path="/expired" element={<ExpiredSession />} />

          <Route path="/profileSettings" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/adminSettings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/mentormatches" element={<ProtectedRoute><MentorMatches /></ProtectedRoute>} />
          <Route path="/menteematches" element={<ProtectedRoute><MenteeMatches /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />

        </Routes>
      </div>
    </Router>
  );
}


export default App;
