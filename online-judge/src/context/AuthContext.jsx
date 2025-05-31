import { createContext, useEffect, useState } from "react";
import axios from "axios";
export const AuthContext = createContext(null);

export const AuthContextProvider = (props) => {
    const [isAdmin,setisAdmin] = useState(null);
    const [isLoggedin, setisLoggedin] = useState(null);
    useEffect(() => {
        const checkadmin = async () => {
            try{
                const response = await axios.get("http://localhost:5000/me", {withCredentials:true});
                if(response.data.success){
                    setisLoggedin(true);
                    if(response.data.role === "admin")
                        setisAdmin(true);
                }
            }
            catch(error){
                console.error("Error in getting token", error);
            }
        }
        
        checkadmin();
    },[isAdmin,isLoggedin]);
    // console.log(isAdmin);

    const contextValues = {isAdmin,isLoggedin};
    return (
        <AuthContext.Provider value={contextValues}>
            {props.children}
        </AuthContext.Provider>
    )
}