const mongoose=require('mongoose')

let categorySchema=new mongoose.Schema({
    category:{
        type:String,
        required:true
    },

    brandName:{
        type:Array,
       default:[]
    },

    flag:{
        type:Boolean,
        required:true
    }
})

let categoryModel=mongoose.model('category',categorySchema)
module.exports=categoryModel


