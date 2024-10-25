import { useState } from "react";
import "./Signup.css";
import { FaUser, FaLock } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";

import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/RegistrationService.js";

function Signup() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [signupError, setSignupError] = useState("");
    const [signupSuccess, setSignupSuccess] = useState("");

    if (auth.token) {
        throw new Error("You need to log out before registering a new account!");
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const elements = event.currentTarget.elements;

        //Login handler handles redirection in case of successful log in
        const registrationRequest = await registerUser({
            username: elements.username.value, 
            email: elements.email.value,
            password: elements.password.value, 
        });

        if (!registrationRequest.ok) {
            const message = registrationRequest.errors.map(e => e.msg || e).join("\n");
            setSignupError(message);
        }
        else {
            setSignupError("");
            setSignupSuccess(`Registration succesful: \n ${registrationRequest.details.username} \n ${registrationRequest.details.email}. \n You will be redirected to the login page soon.`);
            setTimeout(() => navigate("/login"), 3000);
        }
    }

    return (
        <div className="formWrapper">
            <form onSubmit={handleSubmit}>
                <h1>Login</h1>

                <div>
                    <FaUser className="icon" /> <input type='text' name="username" placeholder='Username'></input>
                </div>

                <div>
                    <IoIosMail className="icon" /> <input type='email' name="email" placeholder='E-mail'></input>
                </div>

                <div>
                    <FaLock className="icon" /> <input type='password' name="password" placeholder='Password'></input>
                </div>

                <button type='submit'>
                    Register
                </button>

                <div className="error" hidden={signupError ? false : true}>{signupError}</div>
                <div className="success" hidden={signupSuccess ? false : true}>{signupSuccess}</div>

                <div className="signup">
                    Already have an account? <Link to={"/login"}>Log in</Link>
                </div>
                
                <hr />

                <button disabled>Sign up with Google (coming soon)</button>
            </form>
        </div>
    )
}

export default Signup;