// const db=require('../config/connection')
// const collections=require('../models/collections')
// const bcrypt=require('bcrypt')
// const ObjectId=require('mongodb').ObjectId

// module.exports={
//     doSignup:(userData)=>{
//         return new Promise(async(resolve, reject) => {
//              userData.password =await bcrypt.hash(userData.password,10)
//              let block=false
//              let {name,email,mob_no,password,address,pincode}=userData
//             db.get().collection(collections.USER_COLLECTION).insertOne({name,email,mob_no,password,address,pincode,block}).then((data)=>{
//                 resolve(data)
                
//             })
//         })
//     },
//     doLogin:(userData)=>{
//         let response={
//             status:false
//         };
//         return new Promise(async(resolve, reject) => {
//         let user=await db.get().collection(collections.USER_COLLECTION).findOne({email:userData.email})
//         if(user&&user.block==false){
//             bcrypt.compare(userData.password,user.password).then((result)=>{
//                 if(result){
//                     response.status=true;
//                     response.user=user.name;
//                     resolve(response)
//                 }
//                 else
//                 resolve({status:false})
//             })
//         }
//         else{
//             resolve({status:false})
//         }
//         })
//     },
    
//     doValidate:(userData)=>{
//         return new Promise((resolve, reject) => {
//             db.get().collection(collections.USER_COLLECTION).findOne({email:userData.email}).then((result)=>{
//                 resolve(result)
//             })
//         })
//     }


// }
const userService=require('../services/userService')

let invalidUser;

module.exports={

    user_home:(req,res)=>{
        res.render('user_home')
    },


    user_login:(req,res)=>{
        if(invalidUser){
            res.render('user_login',{invalidUser})
            invalidUser=false;
        }
        else
        res.render('user_login')
    },

    user_signin:(req,res)=>{
        userService.doLogin(req.body).then((result)=>{
            if(result.status){
                res.redirect('/')
            }
            else{
                invalidUser=true;
                res.redirect('/user_login')
            }
        })
    },

    user_otp:(req,res)=>{
        userService.doValidate(req.body).then((result)=>{
            if(result){
    res.redirect('/user_signup')
            }
            else{
                userService.doSignup(req.body).then((data)=>{
                    res.redirect('/signup_otp')
                })  
            }
        })
    
    },

    user_signup:(req,res)=>{
        res.render('user_signup')
    },

    user_forgotPassword:(req,res)=>{
        res.render('forgot_password')
    },

    user_otp:(req,res)=>{
        res.render('signup_OTP')
    },

user_submitOtp:(req,res)=>{
    res.send(req.body)
}
    
}