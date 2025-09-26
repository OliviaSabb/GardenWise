import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import GardenPlanner from './pages/GardenPlanner';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link className="btn" to="/">Home</Link>
        <Link className="btn" to="/garden-planner">Garden Planner</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/garden-planner" element={<GardenPlanner/>}/>
      </Routes>
    </BrowserRouter>    
  );
}

export default App;
