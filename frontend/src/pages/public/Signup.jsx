import "./LoginSignup.css";

import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";

import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/RegistrationService.js";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import SuccessMessage from "../../components/SuccessMessage.jsx";

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
            const message =  registrationRequest.error;
            setSignupError(message);
        }
        else {
            setSignupError("");
            setSignupSuccess(`Registration succesful: \n ${registrationRequest.data.username} \n ${registrationRequest.data.email}. \n You will be redirected to the login page soon.`);
            setTimeout(() => navigate("/login"), 3000);
        }
    }

    return (
        <div className="page-container">
            <div className="page-title"> <h1>Sign up</h1> </div>
            <form className="form-wrapper" onSubmit={handleSubmit}>

                <div className="input-with-custom-icon">
                    <FaUser className="icon" /> <input type='text' name="username" placeholder='Username'></input>
                </div>

                <div className="input-with-custom-icon">
                    <IoIosMail className="icon" /> <input type='email' name="email" placeholder='E-mail'></input>
                </div>

                <div className="input-with-custom-icon">
                    <FaLock className="icon" /> <input type='password' name="password" placeholder='Password'></input>
                </div>

                <button type='submit'> Register </button>

                {signupError && <ErrorMessage text={signupError} />}
                {signupSuccess && <SuccessMessage text={signupSuccess} />}

                <div className="signup-login-link">
                    Already have an account? <Link to={"/login"}>Log in</Link>
                </div>
                
                <hr />

                <button disabled>Sign up with Google (coming soon)</button>
            </form>
        </div>
    )
}

export default Signup;