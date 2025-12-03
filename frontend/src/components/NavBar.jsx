import {Link} from "react-router-dom";
import "./NavBar.css"

function NavBar({ isLoggedIn, onLogout}) {
    return (
        <nav className="site-nav" role="navigation">
            <div className="site-nav-inner">
                <div className="site-nav-left">
                    <Link className="site-nav-link" to="/">Home</Link>
                    <Link className="site-nav-link" to="/garden-planner">Garden Planner</Link>
                    <Link className="site-nav-link" to="/plant-info">Plant Info</Link>
                    <Link className="site-nav-link" to="/profile">Profile Settings</Link>
                </div>
            
                <div className="site-nav-spacer" />
        
                <div className="site-nav-right">
                    {isLoggedIn ? (
                        <button className="site-nav-btn logout" onClick={onLogout}>Logout</button>
                    ) : (
                        <Link className="site-nav-btn login" to="/login">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default NavBar;