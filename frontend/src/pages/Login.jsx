import { useState } from "react";
import "./Login.css";
import { FaFish, FaUser, FaLock } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

function Login() {
    const auth = useAuth();
    const [loginError, setLoginError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        const elements = event.currentTarget.elements;

        //Login handler handles redirection in case of successful log in
        const loggedIn = await auth.loginHandler({username: elements.username.value, password: elements.password.value});

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
                    <label><input type="checkbox" name="rememberme" />Remember me</label>
                    <div><a href="#">Forgot password?</a> <FaFish style={{verticalAlign: "middle"}}/></div>
                </div>

                <button type='submit'>
                    Login
                </button>

                <div className="error" hidden={loginError ? false : true}>{loginError}</div>

                <div className="signup">
                    Don&apos;t have an account yet? <a href="#">Sign up</a>
                </div>
                
                <hr />

                <button disabled>Login with Google</button>
            </form>
        </div>
    )
}

export default Login;