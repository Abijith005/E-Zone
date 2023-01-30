const db=require('../config/connection')
const collections = require('../models/collections')
const ObjectId=require('mongodb').ObjectId
module.exports={
    adminLogin:()=>{
        return new Promise((resolve, reject) => {
           var data= db.get().collection(collections.ADMIN_COLLECTION).findOne({name:'admin'})
           resolve(data)
            
        })
    },
    user_details:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).find().sort({name:1}).toArray().then((result)=>{
                resolve(result)
            })
               
        })
    },
    block_user:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{block:true}})
        })
    },
    unblock_user:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{block:false}})
        })
    },
    add_product:(productData)=>{
        productData.flag=false;
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).insertOne(productData)
        })
    },
    list_product:()=>{
return new Promise((resolve, reject) => {
    db.get().collection(collections.PRODUCT_COLLECTION).find().sort({name:1}).toArray().then((result)=>{
        resolve(result)

    })
})
    },
    findToUpdate:(id)=>{
return new Promise((resolve, reject) => {
    db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectId(id)}).then((result)=>{
        resolve(result)
    })
})
    },

    update_product:(id,productData)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{product_name:productData.product_name,image:productData.image,category:productData.category,company:productData.company,price:productData.price,product_Details:productData.product_Details}})
        })
    },

    flag_product:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{flag:true}})
        })
    },

    unflag_product:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{flag:false}})
        })
    },

    user_search:(userData)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).find({$or:[{name:new RegExp(userData.name,'i')},{email: userData.name},{mob_no:userData.name}]}).toArray().then((result)=>{
                resolve(result)
            })
        })
    }


    
    
    
}