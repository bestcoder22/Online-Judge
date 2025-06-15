import { useContext } from "react"
import { Outlet , Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
const ProtectedRoutes = () => {
    const {userinfo} = useContext(AuthContext);
    return userinfo ? <Outlet/> : <Navigate to='/login'/>
}

export default ProtectedRoutes;