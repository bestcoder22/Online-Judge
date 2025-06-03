import { createContext, useEffect, useState } from "react";
import axios from "axios";
export const AuthContext = createContext(null);

export const AuthContextProvider = (props) => {
    const [isAdmin,setisAdmin] = useState(null);
    const [userinfo,setUserinfo] = useState(null);

    useEffect(() => {
        const checkadmin = async () => {
            try{
                const response = await axios.get("http://localhost:5000/me", {withCredentials:true});
                if(response.data.success){
                    const userid=response.data.id
                    const response_user = await axios.post("http://localhost:5000/getuser", {userid});
                    setUserinfo(response_user.data.user);
                    if(response.data.role === "admin")
                        setisAdmin(true);
                }
            }
            catch(error){
                console.error("Error in getting token", error);
            }
        }
        
        checkadmin();
    },[]);
    // console.log(isAdmin);

    const contextValues = {isAdmin,userinfo};
    return (
        <AuthContext.Provider value={contextValues}>
            {props.children}
        </AuthContext.Provider>
    )
}