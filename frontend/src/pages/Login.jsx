import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import "./Login.css";

function Login({OnLoginSuccess}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        const payload = {
            username,
            password
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/token/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.access) {
                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);
                alert("Login successful");
                navigate("/garden-planner");
                
                /* if(OnLoginSuccess) {
                    alert("Login successful");
                    navigate("/garden-planner");
                } */
                
                //return;
            }

            if(response.status === 401) {
                setError("Invalid credentials");
            } else {
                const data = await response.json();
                setError(data.detail || "Login failed");
            }
        } catch (err) {
            console.group(err);
            setError("Server error. Please try again later")
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 id="login-title">Login</h2>

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <input
                            id="username"
                            name="username"
                            className="input input-username"
                            type="text" 
                            placeholder="Username" 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-field">
                        <input
                            id="password"
                            name="password"
                            className="input input-password"
                            type="password" 
                            placeholder="Password"                   
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    {error && (<p id="login-error" className="error-text" role="alert">{error}</p>)}

                    <button className="btn btn-primary" type="submit">Login</button>
                </form>
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
            
        </div>
    )
    
}

export default Login;