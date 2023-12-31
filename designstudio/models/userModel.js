import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    phone:{
        type:String,
        require:true,
    },
    address:{
        type:String,
        require:true,
    },
    role:{
        type:String,
        default:'0'
    },
    active: {
        type: Boolean,
        default: true,
        active: true,// Set to true by default, meaning the user is active
      }

},{timestamps:true})

export default mongoose.model('users',userSchema)