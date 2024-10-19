import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedPage = ({ children }) => {
    const auth = useAuth();
    if (!auth.token) {
        return (
            <Navigate to={"/login"} replace />
        )
    }

    return children;
}

export default ProtectedPage;