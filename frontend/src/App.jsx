import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import GardenPlanner from './pages/GardenPlanner';
import PlantInfo from './pages/PlantInfo';
import Login from './pages/Login';
import Registration from './pages/Registration';
import './App.css';

function App() {
  return (
    <BrowserRouter>
    <nav>
      <div className="nav-left">
        <Link className="btn" to="/">Home</Link>
        <Link className="btn" to="/garden-planner">Garden Planner</Link>
        <Link className="btn" to="/plant-info">Plant Info</Link>
      </div>
      
      <div className="nav-spacer" />

      <div className="nav-right">
        <Link className="btn login-btn" to="/login">Login</Link>
      </div>
    </nav>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/garden-planner" element={<GardenPlanner/>}/>
        <Route path="/plant-info" element={<PlantInfo/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    </BrowserRouter>    
  );
}

export default App;
