import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Navbar() {
    const auth = useAuth();
    const loggedIn = !!auth.token;

    return(
        <div className="navbar">
            <div className="left">
                <span>LOGO</span>
                <NavLink to={"/"}>Panda Warden</NavLink>
                {loggedIn && <NavLink to={"/dashboard"}>Dashboard</NavLink>}
            </div>

            <div className="right">
                {
                    loggedIn ?
                        <>
                            <NavLink to={"/account"}>Account</NavLink>
                            <NavLink onClick={auth.logoutHandler}>Sign Out</NavLink>
                        </>
                        :
                        <>
                            <NavLink to={"/login"}>{"Log In"}</NavLink>
                            <NavLink to={"/signup"}>{"Sign Up"}</NavLink>
                        </>
                }
            </div>
        </div>
    )
}

export default Navbar;