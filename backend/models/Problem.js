import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema({
    problemid: {
    type: Number,
    required: true,
    unique: true,
    },
    tag: {
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }

})

const Problem = mongoose.model('Problem', ProblemSchema);

export default Problem;