import User from "../models/User.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();

export const login = async (req,res) => {
    const user = await User.findOne({email: req.body.email});
    if(user){
        if(req.body.password === user.password){
            const token = jwt.sign({id : user._id , role : "user"}, process.env.JWT_SECRET);
            res.cookie("access_token",token,{
                httpOnly: true
            })
            return res.status(200).json({success:true , message:"Successfully Logged In"});
        }
        else{
            return res.json({success:false , message:"Wrong Password!!", errors:"Wrong Password!!"});
        }
    }
    else{
        return res.json({success:false , message:"User Not Found", errors:"Email not registered!!"});
    }
}

export const signup = async(req,res) => {

    const user = await User.findOne({email: req.body.email});
    if(user){
        return res.json ({success:false , message:"Email already exists" , errors:"User already exists!"});
    }
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password : req.body.password
    })

    await newUser.save();

    return res.status(201).json({success:true, message: "User registered successfully" });
}

export const logout = async (req,res) => {
    res.clearCookie("access_token", {
        httpOnly:true
    });
    return res.status(200).json({success:true, message:"Logged Out Successfully!"});
}


export const me = async (req,res) => {
    res.json({
        success : true,
        id : req.userId,
        role : req.userRole
    })
}