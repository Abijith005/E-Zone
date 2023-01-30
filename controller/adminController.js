// const db=require('../config/connection')
// const collections = require('../models/collections')
// const ObjectId=require('mongodb').ObjectId
// module.exports={
//     adminLogin:()=>{
//         return new Promise((resolve, reject) => {
//            var data= db.get().collection(collections.ADMIN_COLLECTION).findOne({name:'admin'})
//            resolve(data)
            
//         })
//     },
//     user_details:()=>{
//         return new Promise((resolve, reject) => {
//             db.get().collection(collections.USER_COLLECTION).find().sort({name:1}).toArray().then((result)=>{
//                 resolve(result)
//             })
               
//         })
//     },
//     block_user:(id)=>{
//         return new Promise((resolve, reject) => {
//             db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{block:true}})
//         })
//     },
//     unblock_user:(id)=>{
//         return new Promise((resolve, reject) => {
//             db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{block:false}})
//         })
//     },
//     add_product:(productData)=>{
//         productData.flag=false;
//         return new Promise((resolve, reject) => {
//             db.get().collection(collections.PRODUCT_COLLECTION).insertOne(productData)
//         })
//     },
//     list_product:()=>{
// return new Promise((resolve, reject) => {
//     db.get().collection(collections.PRODUCT_COLLECTION).find().sort({name:1}).toArray().then((result)=>{
//         resolve(result)

//     })
// })
//     },
//     findToUpdate:(id)=>{
// return new Promise((resolve, reject) => {
//     db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectId(id)}).then((result)=>{
//         resolve(result)
//     })
// })
//     },

//     update_product:(id,productData)=>{
//         return new Promise((resolve, reject) => {
//             db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{product_name:productData.product_name,image:productData.image,category:productData.category,company:productData.company,price:productData.price,product_Details:productData.product_Details}})
//         })
//     },

//     flag_product:(id)=>{
//         return new Promise((resolve, reject) => {
//             db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{flag:true}})
//         })
//     },

//     unflag_product:(id)=>{
//         return new Promise((resolve, reject) => {
//             db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{flag:false}})
//         })
//     },

//     user_search:(userData)=>{
//         return new Promise((resolve, reject) => {
//             db.get().collection(collections.USER_COLLECTION).find({$or:[{name:new RegExp(userData.name,'i')},{email: userData.name},{mob_no:userData.name}]}).toArray().then((result)=>{
//                 resolve(result)
//             })
//         })
//     }

// }


const adminService=require('../services/adminService')
module.exports={

    admin_loginPage:(req,res)=>{
        res.render('admin_login')
        },

        admin_login:(req,res)=>{
            adminService.adminLogin().then((data)=>{
                if(req.body.admin_name==data.email&&req.body.password==data.password){
            res.redirect('admin_home') 
                }
                else
                res.redirect('/admin')
            })
        },

        admin_home:(req,res)=>{
            res.render('admin_home')
        },
        admin_product:(req,res)=>{
            adminService.list_product().then((result)=>{
                    res.render('product',{result})
            })
        },

        admin_userDetails:(req,res)=>{
            adminService.user_details().then((result)=>{
                if(datas){
                    result=datas
                }
                
                res.render('user_Details',{result})
                datas=null;
            })
        },

        admin_orderDetails:(req,res)=>{
            res.render('order_Details')
        },

        admin_userBlock:(req,res)=>{
            adminService.block_user(req.params)
                res.redirect('/admin/user_Details')
            
        },

        admin_userUnblock:(req,res)=>{
            adminService.unblock_user(req.params)
            res.redirect('/admin/user_Details')
        },

        admin_productEditPage:async(req,res)=>{
            let data=await adminService.findToUpdate(req.params)
            res.render('edit_product',{data})
        },

        admin_productEdit:async(req,res)=>{
            adminService.update_product(req.params.id,req.body)
                res.redirect('/admin/admin_products')
        
        },

        admin_productAddPage:(req,res)=>{
            res.render('add_product')
        },

        admin_productAdd:(req,res)=>{
            adminService.add_product(req.body)
            res.redirect('/admin/admin_products')
        },
        admin_productFlag:(req,res)=>{
            adminService.flag_product(req.params)
            res.redirect('/admin/admin_products')
        },

        admin_productUnflag:(req,res)=>{
            adminService.unflag_product(req.params)
            res.redirect('/admin/admin_products')
        },

        admin_userSearch:(req,res)=>{
            adminService.user_search(req.body).then((result)=>{
            datas=result;
            res.redirect('/admin/user_Details')
             })
        },

        admin_categoryPage:(req,res)=>{
            res.render('category')
        }





}