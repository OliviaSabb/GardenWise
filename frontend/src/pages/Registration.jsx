import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import "./Registration.css";


function Registration(){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [zipcode, setZipcode] = useState("");
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
        <div className="register-page">
            <div className="register-card">
                <h2 id="register-title" className="register-title">Create an Account</h2>

                <form className="register-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <input 
                            id="reg-username"
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
                            id="reg-email"
                            name="email"
                            className="input input-email"
                            type="email" 
                            placeholder="Email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-field">
                        <input
                            id="reg-password"
                            name="password"
                            className="input input-email"
                            type="password" 
                            placeholder="Password"                   
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                   
                   <div className="form-field">
                        <input 
                            id="reg-confirm"
                            name="confirm"
                            className="input input-password-confirm"
                            type="password" 
                            placeholder="Confirm Password" 
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />
                    </div>

                    <div className="form-field"> {/* added zipcode */}
                        <input
                            id="reg-zipcode"
                            name="zipcode"
                            className="input input-zipcode"
                            type="text"
                            placeholder="Zip Code"
                            value={zipcode}
                            onChange={(e) => setZipcode(e.target.value)}
                        />
                    </div>
                   
                    {error && (<p id="register-error" className="error-text" role="alert">{error}</p>)}

                    <button className="btn btn-primary" type="submit">Register</button>
                </form>
                <p className="register-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
    
}

export default Registration;