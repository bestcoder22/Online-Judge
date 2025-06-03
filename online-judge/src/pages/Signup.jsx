import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
    const [user,setUser] = useState({
        username: "",
        email: "",
        password : ""
    })
    const changeHandler = (e) =>{
        setUser({...user,[e.target.name]:e.target.value});
    }
    const submit = async () => {
        const response = await axios.post('http://localhost:5000/signup' , user);
        if(response.data.success){
        alert(response.data.message);
        window.location.replace("/login");
        }
        else alert(response.data.errors);
    }

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col space-y-4 border-4 border-indigo-500 rounded-xl shadow-xl/30 px-10 py-15">
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Signup</h2>
                <div className="mt-2 flex flex-col space-y-4">
                    <input name="username" type="text" placeholder="Username"  onChange={changeHandler} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                    <input name="email" type="email" placeholder="Email Address"  onChange={changeHandler} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                    <input name="password" type="password" placeholder="Password"  onChange={changeHandler} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"/>
                </div>
                <div className="flex flex-col justify-center py-5">
                    <button onClick={submit} className="cursor-pointer bg-indigo-500 px-3 py-2 font-bold tracking-tight text-white shadow-xl/10 rounded-xl">Continue</button>
                    <div className="flex justify-center mt-4">
                        <h6>Already have an account?</h6>
                        <Link style={{textDecoration: 'none'}} to='/login'><button className="font-sans tracking-tight cursor-pointer ml-2 bg-emerald-500 text-white rounded-xl px-2">Login Here</button></Link>
                    </div>
                </div>
            </div>
        </div>
    );  
}

export default Signup;