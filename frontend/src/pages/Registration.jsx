import {Link} from "react-router-dom";

function Registration(){
    return (
        <div>
            <h2>Create an Account</h2>
            <form>
                <input type="text" placeholder="Name" required></input>
                <input type="email" placeholder="Email" required/>
                <input type="password" placeholder="Password" required/>
                <input type="password" placeholder="Confirm Password" required/>
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    )
    
}

export default Registration;