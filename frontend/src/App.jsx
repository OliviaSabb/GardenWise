import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import GardenPlanner from './pages/GardenPlanner';
import PlantInfo from './pages/PlantInfo';
import Login from './pages/Login';
import Registration from './pages/Registration';
import SingularPlantInfo from './pages/SingularPlantInfo';
import NavBar from './components/NavBar'
import ProfileSettings from './pages/ProfileSettings';
import './App.css';

// Separate inner app content into a component inside BrowserRouter
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const navigate = useNavigate();

  const handleLogInSuccess = () => {
    setIsLoggedIn(true);
    navigate("/garden-planner");
  }

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    const accessToken = localStorage.getItem("access_token");

    if (refreshToken && accessToken) {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/token/blacklist/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`, // add access token
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
          console.warn("Logout request failed:", response.status);
        }
      } catch (err) {
        console.error("Logout error:", err);
      }
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setIsLoggedIn(false);

    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavBar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      </header>

      <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/garden-planner" element={<GardenPlanner />} />
            <Route path="/plant-info" element={<PlantInfo />} />
            <Route path="/plant-info/:id" element={<SingularPlantInfo />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLogInSuccess}/>} />
            <Route path="/register" element={<Registration />} />
            <Route path="/profile" element={< ProfileSettings/>} />
          </Routes>
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">© {new Date().getFullYear()} GardenWise</div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
