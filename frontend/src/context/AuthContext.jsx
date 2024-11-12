import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
import { getToken } from "../services/LoginService";

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

    const loginHandler = async ({username, password, rememberMe}) => {
        const token = await getToken({username, password});

        saveTokenIntoBrowserStorage(token, rememberMe);
        setToken(token);
    }

    const logoutHandler = () => {
        removeTokenFromBrowserStorage();
        setToken(null);
    }
    const authObject = {
        token,
        loginHandler,
        logoutHandler,  
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


// eslint-disable-next-line react-refresh/only-export-components
export {AuthProvider, useAuth};