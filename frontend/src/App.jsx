import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import GardenPlanner from './pages/GardenPlanner';
import PlantInfo from './pages/PlantInfo';
import Login from './pages/Login';
import Registration from './pages/Registration';
import SingularPlantInfo from './pages/SingularPlantInfo';
import './App.css';

// 🔹 Separate inner app content into a component inside BrowserRouter
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('access_token'));
  }, []);

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
  navigate("/login");
};

  return (
    <>
      <nav>
        <div className="nav-left">
          <Link className="btn" to="/">Home</Link>
          <Link className="btn" to="/garden-planner">Garden Planner</Link>
          <Link className="btn" to="/plant-info">Plant Info</Link>
        </div>

        <div className="nav-spacer" />

        <div className="nav-right">
          {isLoggedIn ? (
            <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <Link className="btn login-btn" to="/login">Login</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/garden-planner" element={<GardenPlanner />} />
        <Route path="/plant-info" element={<PlantInfo />} />
        <Route path="/plant-info/:id" element={<SingularPlantInfo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
