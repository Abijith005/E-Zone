const mongoose=require('mongoose')

let adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    }
})

let adminModel=mongoose.model('admin',adminSchema)
module.exports=adminModel