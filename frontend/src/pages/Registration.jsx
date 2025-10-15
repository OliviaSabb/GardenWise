import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";



function Registration(){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(password !== confirm) {
            setError("Passwords do not match.")
            return;
        }

        setError("");

        //alert("Registration successful!");

        const payload = {
            username,
            email,
            password
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/register/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Registration successful");
                navigate("/login");
                return;
            } else {
                const data = await response.json();
                setError(data.detail || "Registration failed");
            }
        } catch (err) {
            setError("Server error. Please try again later")
        }
    };



    return (
        <div>
            <h2>Create an Account</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Password"                   
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />

                {error && <p>{error}</p>}

                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    )
    
}

export default Registration;