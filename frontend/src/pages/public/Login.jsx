import "./LoginSignup.css";

import { useRef, useState } from "react";
import { FaFish, FaUser, FaLock } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Tooltip from "../../components/Tooltip";
import ErrorMessage from "../../components/ErrorMessage";
import { AlreadyLoggedInError } from "../../services/ErrorClasses";

const TOOLTIP_TEXT = {
    rememberMe: "If you check this box, your credentials will be persisted in your browser's \"Local Storage\", and you will stay logged in until you manually sign out.",
}

function Login() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [loggingIn, setLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState("");
    const loginErrorTimeoutRef = useRef(null);

    if (auth.token) throw new AlreadyLoggedInError();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoggingIn(true);

        const elements = event.currentTarget.elements;

        //Login handler handles redirection in case of successful log in
        try {
            await auth.loginHandler({
                username: elements.username.value, 
                password: elements.password.value, 
                rememberMe: elements.rememberme.checked
            });

            navigate("/dashboard");
        }
        catch (e) {
            setLoggingIn(false);
            setLoginError(e.message);

            if (loginErrorTimeoutRef.current != null) clearTimeout(loginErrorTimeoutRef.current);
            loginErrorTimeoutRef.current = setTimeout(() => setLoginError(""), 3000);
        }
    }

    return (
        <div className="page-container">
            <div className="page-title"> <h1>Log in</h1> </div>
            
            <form className="form-wrapper" onSubmit={handleSubmit}>
                <div className="input-with-custom-icon">
                    <FaUser className="icon" /> <input type='text' name="username" placeholder='Username'></input>
                </div>

                <div className="input-with-custom-icon">
                    <FaLock className="icon" /> <input type='password' name="password" placeholder='Password'></input>
                </div>

                <div className="remember-forgot">
                    <label><input type="checkbox" name="rememberme" />Remember me <Tooltip message={TOOLTIP_TEXT.rememberMe} /> </label>
                    <div><Link to={"passwordrecovery"}>Forgot password?</Link> <FaFish style={{verticalAlign: "middle"}}/></div>
                </div>

                <button type='submit' disabled={loggingIn}> Login </button>

                {loginError && <ErrorMessage text={loginError} />}

                <div className="signup-login-link">
                    Don&apos;t have an account yet? <Link to={"/signup"}>Sign up</Link>
                </div>
                
                <hr />

                <button disabled>Log in with Google (coming soon)</button>
            </form>
        </div>
    )
}

export default Login;