const mongoose=require('mongoose')


let userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },

    email:{
        type:String,
        required:true,
    },

    mob_no:{
        type:String,
        required:true,
    },

    password:{
        type:String,
        required:true,
    },

    block:{
        type:Boolean,
        required:true,
    },
    
    address:{
        type:Array,
        required:true,
    },

    user_cart:{
        type:Array,
        default:[],
        
    },

    user_whishList:{
        type:Array,
        default:[],
    },

    address:{
        type:Array,
       default:[],
    },

    orders:{
        type:Array,
        default:[]
    },

    wallet:{
        type:Number,
        required:true
    },

    walletHistory:{
        type:Array,
        default:[]
    }

})

let userModel=mongoose.model('user',userSchema)
module.exports=userModel;