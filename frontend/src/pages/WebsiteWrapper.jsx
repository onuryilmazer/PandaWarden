import { Outlet } from "react-router-dom"
import { AuthProvider } from "../context/AuthContext";

import Navbar from "../components/Navbar"

export default function WebsiteWrapper() {   

    return(
        <AuthProvider>
            <Navbar/>
            <Outlet/>
        </AuthProvider>
    )
}