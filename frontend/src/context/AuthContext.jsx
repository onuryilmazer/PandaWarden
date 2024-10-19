import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
import { getToken } from "../services/LoginService";
import { useNavigate } from "react-router-dom";

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const navigate = useNavigate()

    const loginHandler = async ({username, password}) => {
        const tokenResponse = await getToken({username, password});

        if (tokenResponse) {
            setToken(tokenResponse);
            navigate("/dashboard");
            return true;
        }
        
        return false;
    }

    const logoutHandler = () => {
        setToken(null);
        navigate("/");
    }

    const authObject = {
        token,
        loginHandler,
        logoutHandler
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