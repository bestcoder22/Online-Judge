import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    avatar_path:{
        type:String,
        default: '/avatar/default-avatar.jpg'
    },
    submissions:[
        {
            problemid : {type:Number,required:true},
            code : {type:String , required:true},
            status : {type:String, required:true}
        }
    ]
})

const User = mongoose.model('user', UserSchema);

export default User;