const mongoose=require('mongoose')

let bannerSchema=new mongoose.Schema({
    image:{
        type:Array,
        required:true
    },

    subIMage:{
        type:Array,
        required:true
    }

})

let bannerModel=mongoose.model('banner',bannerSchema)
module.exports=bannerModel
