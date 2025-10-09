import {Link} from "react-router-dom";

function Login(){
    return (
        <div>
            <h2>Login</h2>
            <form>
                <input type="email" placeholder="Email" required/>
                <input type="password" placeholder="Password" required/>
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    )
    
}

export default Login;