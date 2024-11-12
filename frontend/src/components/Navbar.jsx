import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

function Navbar() {
    const auth = useAuth();
    const navigate = useNavigate();
    const loggedIn = !!auth.token;

    const logoutHandler = () => {
        auth.logoutHandler();
        navigate("/");
    }

    return(
        <div className="navbar">
            <div className="left">
                <NavLink to={"/"}><div className="logo-container"><img className="logo" src={logo}/></div></NavLink>
                <NavLink to={"/"}>Home</NavLink>
                {loggedIn && <NavLink to={"/dashboard"}>Dashboard</NavLink>}
            </div>

            <div className="right">
                {
                    loggedIn ?
                        <>
                            <NavLink to={"/account"}>Account</NavLink>
                            <NavLink onClick={logoutHandler}>Sign Out</NavLink>
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