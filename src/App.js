import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/views/home';
import SignUp from './components/views/signUp';
import Login from './components/views/login';
import Welcome from './components/views/welcome';
import TermsOfUse from './components/views/termsOfUse';
import MenteeMatches from './components/views/menteeMatches';
import ManagerProfile from './components/views/managerProfile';
import Profile from './components/views/profileSettings';
import FullProfile from './components/views/fullViewProfile';
import Help from './components/views/help';
import AdminSettings from './components/views/adminSettings';
import MentorMatches from './components/views/mentorMatches';
import NoPermissions from './components/views/noPermissions';
import Requests from './components/views/requests';
import ProtectedRoute from './components/utils/protectedRoute';
import ExpiredSession from './components/views/expiredSession';


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
          <Route path="/mentorprofile" element={<ProtectedRoute><MentorMatches /></ProtectedRoute>} />
          <Route path="/menteeprofile" element={<ProtectedRoute><MenteeMatches /></ProtectedRoute>} />
          <Route path="/managerprofile" element={<ProtectedRoute><ManagerProfile /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />

        </Routes>
      </div>
    </Router>
  );
}


export default App;
