import {Link} from "react-router-dom";
import {useState} from "react";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        const payload = {
            username,
            password
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/register/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            const text = await res.text(); // try text first to avoid JSON parse issues
            console.log("Status:", res.status);
            console.log("Content-Type:", res.headers.get("content-type"));
            console.log("Body:", text);

            if (response.ok) {
                alert("Login successful");
                Navigate("/garden-planner");
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