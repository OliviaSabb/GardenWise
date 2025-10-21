import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";

function Login() {
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
                alert("Login successful");

                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);

                navigate("/garden-planner");
                return;
            }

            
            if(response.status === 401) {
                setError("Invalid credentials");
            } else {
                const data = await response.json();
                setError(data.detail || "Login failed");
            }
        } catch (err) {
            setError("Server error. Please try again later")
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                
                <input 
                    type="password" 
                    placeholder="Password"                   
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p>{error}</p>}

                <button type="submit">Register</button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    )
    
}

export default Login;