import { useState,useEffect , useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios"

const Navbar = () => {
    const {isLoggedin} = useContext(AuthContext);

    const handlechange = async () => {
        const response = await axios.post("http://localhost:5000/logout",{},{withCredentials:true});
        if(response.data.success){
            alert(response.data.message);
        }
        window.location.replace("/");
        

    }
    return (
        <div>
            <div className="flex justify-around mt-5">
                <div>
                    <Link style={{textDecoration:'None'}} to='/'><h2 className="font-serif font-bold mt-2">Online Judge</h2></Link>
                </div>
                <div className="flex justify-around m-2">
                    <Link style={{textDecoration:'None'}} to='/problems'><h4 className="px-5">Problems</h4></Link>
                    <Link style={{textDecoration:'None'}} to='/leaderboard'><h4 className="px-5">Leaderboard</h4></Link>
                    <Link style={{textDecoration:'None'}} to='/admin'><h4 className="px-5">Admin</h4></Link>
                </div>
                {isLoggedin===true ? <button onClick={handlechange} className="cursor-pointer border rounded-xl shadow-xl/15 px-4 py-2">Logout</button> : <Link style={{textDecoration: 'none'}} to='/login'><button className="cursor-pointer border rounded-xl shadow-xl/15 px-4 py-2">Login</button></Link>}
                
            </div>
            <hr className="mt-3.5"/>
        </div>
    )
}
export default Navbar;