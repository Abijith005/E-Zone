const db=require('../config/connection')
const collections=require('../models/collections')
const bcrypt=require('bcrypt')
const ObjectId=require('mongodb').ObjectId
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve, reject) => {
             userData.password =await bcrypt.hash(userData.password,10)
             let block=false
             let {name,email,mob_no,password,address,pincode}=userData
            db.get().collection(collections.USER_COLLECTION).insertOne({name,email,mob_no,password,address,pincode,block}).then((data)=>{
                resolve(data)
                
            })
        })
    },
    doLogin:(userData)=>{
        let response={
            status:false
        };
        return new Promise(async(resolve, reject) => {
        let user=await db.get().collection(collections.USER_COLLECTION).findOne({email:userData.email})
        if(user&&user.block==false){
            bcrypt.compare(userData.password,user.password).then((result)=>{
                if(result){
                    response.status=true;
                    response.user=user.name;
                    resolve(response)
                }
                else
                resolve({status:false})
            })
        }
        else{
            resolve({status:false})
        }
        })
    },
    
    doValidate:(userData)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).findOne({email:userData.email}).then((result)=>{
                resolve(result)
            })
        })
    },


    user_searchProduct:(productData)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).find({$or:[{product_name:productData},{company:productData},{category:productData}]}).toArray().then((result)=>{
                resolve(result)
            })
        })
        
    }

}
