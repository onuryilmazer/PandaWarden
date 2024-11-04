import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
import { getToken } from "../services/LoginService";
import { useNavigate } from "react-router-dom";

const getTokenFromBrowserStorage = () => {
    let token = sessionStorage.getItem("token") || localStorage.getItem("token");

    return token;
}

const saveTokenIntoBrowserStorage = (token, rememberMe) => {
    let storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem("token", token);
}

const removeTokenFromBrowserStorage = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
}

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(getTokenFromBrowserStorage());
    const navigate = useNavigate();

    const loginHandler = async ({username, password, rememberMe}) => {
        const tokenResponse = await getToken({username, password});

        if (tokenResponse.ok) {
            saveTokenIntoBrowserStorage(tokenResponse.token, rememberMe);
            setToken(tokenResponse.token);
            navigate("/dashboard");
            return true;
        }
        
        console.log(tokenResponse.errors);
        return false;
    }

    const logoutHandler = (navigateToHomepage = true) => {
        removeTokenFromBrowserStorage();
        setToken(null);
        if (navigateToHomepage) navigate("/");
    }

    /**
     * @returns {Error} an error object you can set into your state from async code and then throw in sync code
     */
    const expiredLoginErrorGenerator = (reason) => {
        const error = new Error(`Login required. (${reason})`);
        error.redirectTo = "/login";
        error.redirectToDescription = "the login page";
        error.action = () => logoutHandler(false);
        return error;
    }

    const authObject = {
        token,
        loginHandler,
        logoutHandler,  
        expiredLoginErrorGenerator,      
    };

    return (
        <AuthContext.Provider value={authObject}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => {
    return useContext(AuthContext);
}

export {AuthProvider, useAuth};