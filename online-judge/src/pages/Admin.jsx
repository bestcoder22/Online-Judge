import { useContext } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext"
import { Link } from "react-router-dom";

const Admin = () => {
    const {isAdmin,userinfo} = useContext(AuthContext);
    return(
        <div>
            <Navbar />
            <h2 className="flex justify-center m-5 font-bold">Welcome to Admin Page!!</h2>
            {userinfo ? 
            <div>
                {isAdmin!=true ? 
                <div className="flex flex-col m-5">
                    <div className="flex justify-center m-5">Hello Admin</div>
                    <div className="flex justify-center">
                        <Link style={{textDecoration:'none'}} to='/admin/addproblem'><button className="cursor-pointer border rounded-xl shadow-xl/15 px-4 py-2 m-7">Add problem</button></Link>
                        <Link style={{textDecoration:'none'}} to='/admin/updateproblem'><button className="cursor-pointer border rounded-xl shadow-xl/15 px-4 py-2 m-7">Update problem</button></Link>
                    </div>
                </div> 
                :   
                <div className="flex justify-center m-5">
                    Sorry. You are not allowed!!
                </div>
                }
            </div> 
            : 
            <div className="flex justify-center m-5">
                Please Login to continue!!

            </div>}
            
        </div>
        
    )
}

export default Admin;