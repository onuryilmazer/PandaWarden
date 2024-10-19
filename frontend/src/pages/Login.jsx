import { useState } from "react";
import "./Login.css";
import { FaFish, FaUser, FaLock } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Tooltip from "../components/Tooltip";

const TOOLTIP_TEXT = {
    rememberMe: "If you check this box, your credentials will be persisted in your browser's \"Local Storage\", and you will stay logged in until you manually sign out.",
}

function Login() {
    const auth = useAuth();
    const [loginError, setLoginError] = useState("");

    if (auth.token) {
        throw new Error("You are already logged in!");
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const elements = event.currentTarget.elements;

        //Login handler handles redirection in case of successful log in
        const loggedIn = await auth.loginHandler({username: elements.username.value, 
            password: elements.password.value, 
            rememberMe: elements.rememberme.checked});

        if (!loggedIn) {
            setLoginError("Invalid username and/or password.");
            setTimeout(() => setLoginError(""), 3000);
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
                    <FaLock className="icon" /> <input type='password' name="password" placeholder='Password'></input>
                </div>

                <div className="remember-forgot">
                    <label><input type="checkbox" name="rememberme" />Remember me <Tooltip message={TOOLTIP_TEXT.rememberMe} /> </label>
                    <div><Link to={"passwordrecovery"}>Forgot password?</Link> <FaFish style={{verticalAlign: "middle"}}/></div>
                </div>

                <button type='submit'>
                    Login
                </button>

                <div className="error" hidden={loginError ? false : true}>{loginError}</div>

                <div className="signup">
                    Don&apos;t have an account yet? <Link to={"/signup"}>Sign up</Link>
                </div>
                
                <hr />

                <button disabled>Login with Google</button>
            </form>
        </div>
    )
}

export default Login;