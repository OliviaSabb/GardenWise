import {Link} from "react-router-dom";
import {useState} from "react";


function Registration(){
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if(password !== confirm) {
            setError("Passwords do not match.")
            return;
        }

        setError("");
        alert("Registration successful!");
    };



    return (
        <div>
            <h2>Create an Account</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" required></input>
                <input type="email" placeholder="Email" required/>
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