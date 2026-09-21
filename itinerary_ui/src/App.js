import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './Components/AllCss/payana-design-system.css';
import HomeP from './Components/HomeP';
import Login from './Components/Login';
import Register from './Components/Register';
import Main from './Components/Main';
import Dashboard from './Components/Dashboard';
import Profile from './Components/Profile';
import MoodForm from './Components/MoodForm';
import McqClassification from './Components/McqClassification';
import MCQResult from './Components/MCQResult';
import ItineraryDisplay from './Components/ItineraryDisplay';
import MyItineraries from './Components/MyItineraries';
import AmnLogin from './AdminComponent/AmnLogin';
import Admin from './AdminComponent/Amain';
import AdminDashboard from './AdminComponent/AdminDashboard';
import UpdItinerary from './AdminComponent/UpdItinerary';
import ViewItineraries from './AdminComponent/ViewItineraries';
import UpdEvents from './AdminComponent/UpdEvents';
import AdminProfile from './AdminComponent/AdminProfile';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminProtectedRoute from './AdminComponent/AdminProtectedRoute';
import ManageUsers from './AdminComponent/ManageUsers';
import AdminFeedbacks from './AdminComponent/AdminFeedbacks';
import NotFound from './Components/NotFound';

export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);

  // Restore user from localStorage on mount (without password)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Strip password if it exists (safety net)
        const { password, ...safeUser } = parsed;
        setUser(safeUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Persist user to localStorage whenever it changes (without password)
  useEffect(() => {
    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem('user', JSON.stringify(safeUser));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeP />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/mcq" element={
            <ProtectedRoute>
              <McqClassification />
            </ProtectedRoute>
          } />
          <Route path="/AdminLogin" element={<AmnLogin />} />

          {/* Protected User Routes */}
          <Route path="/Main" element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="mcq-result" element={<MCQResult />} />
            <Route path="Profile" element={<Profile />} />
            <Route path="mood-form" element={<MoodForm />} />
            <Route path="ItineraryDisplay" element={<ItineraryDisplay />} />
            <Route path="mcqclassification" element={<McqClassification />} />
            <Route path="my-itineraries" element={<MyItineraries />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <Admin />
            </AdminProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="manageusers" element={<ManageUsers />} />
            <Route path="upditinerary" element={<UpdItinerary />} />
            <Route path="viewitineraries" element={<ViewItineraries />} />
            <Route path="updevents" element={<UpdEvents />} />
            <Route path="feedbacks" element={<AdminFeedbacks />} />
            <Route path="adminprofile" element={<AdminProfile />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;