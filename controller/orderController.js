const session = require("express-session")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const userService = require("../services/userService")


module.exports={
    checkOutPage:(req,res)=>{
        userModel.findOne({_id:req.session.userDetails._id},{user_cart:1}).then((cart)=>{
           if(cart.user_cart.length>0){
            userService.get_userDetails(req.session.userDetails._id).then((data)=>{
                orderDatas=req.session.orderDatas
                let sum = 0;
                orderDatas.forEach(item => {
                    sum = sum + parseInt(item.price) * item.quantity
                })
                orderDatas.totalAmount=sum
                req.session.selectAddress?selectAddress=req.session.selectAddress:selectAddress=null
                req.session.changeAddress?changeAddress=true:changeAddress=false
                data.address.length >= 3 ? maxAddress = true : maxAddress = false
                req.session.editCheckOutAddress ? edit = req.session.editCheckOutAddress : edit = null
                req.session.checkOutAddAddress ? addAddress = true : addAddress = false
                res.render('checkOutPage',{orderDatas,data,changeAddress,addAddress, maxAddress, edit,selectAddress})
                req.session.changeAddress=false
                req.session.checkOutAddAddress= false
                req.session.editCheckOutAddress = null
                req.session.selectAddress=null
                edit = null
                addAddress = false
            })

        }
        else{
            res.redirect('/cart')
        }
       })
        // req.session.orderDatas=null
    },
    

    changeAddress:(req,res)=>{
     return new Promise((resolve, reject) => {
        req.session.changeAddress=true
            res.redirect('/checkOutPage')
       })
    },

    checkOutAddAddressPage:(req,res)=>{
        return new Promise((resolve, reject) => {
            req.session.checkOutAddAddress = true
            res.redirect('/changeAddress')
        })
    },

    checkOutAddAddress:(req,res)=>{
        return new Promise((resolve, reject) => {
            userService.user_addAddress(req.session.userDetails._id, req.body).then(() => {
                res.redirect('/changeAddress')
            })
        })
    },

    deleteCheckOutAddress:(req,res)=>{
        return new Promise((resolve, reject) => {
            userService.user_delete_address(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
                res.redirect('/changeAddress')
            })
        })
    },

    editCheckOutAddress:(req,res)=>{
        return new Promise((resolve, reject) => {
            userService.getAddress(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
                req.session.editCheckOutAddress = result;
                res.redirect('/checkOutAddAddress')
            })
        })
    },

    updateCheckOutAddress:(req,res)=>{
        return new Promise((resolve, reject) => {
            userService.addressUpdate(parseInt(req.params.id), req.body).then(() => {
            res.redirect('/changeAddress')
        })
        
        })
    },

    selectAddress:(req,res)=>{
        return new Promise((resolve, reject) => {
            userService.getAddress(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
                req.session.selectAddress = result;
                res.redirect('/checkOutPage')
            })
        })
    },

    placeOrder:(req,res)=>{
        return new Promise((resolve, reject) => {
            let data=req.body
            console.log(data);
            for (let i=0;i<data.products_id.length;i++){
               let amount=data.price[i]*data.quantity[i]
                   orderId=Date.now()
                userModel.updateOne({_id:req.session.userDetails._id},{$push:{orders:{order_id:orderId,deliveryAddress:data.deliveryAddress,paymentMethod:data.paymentMethod,product_id:data.products_id[i],productName:data.productsName[i],category:data.category[i],quantity:data.quantity[i],couponStatus:data.couponStatus,totalAmount:amount,orderDate:Date(),orderStatus:'Not Delivered'}}}).then((result)=>{
                })
            }
                userModel.updateOne({_id:req.session.userDetails._id},{$unset:{user_cart:{}}}).then(()=>{
                    res.render('orderConfirm')
                    resolve()
            })
        })
    },

    adminCancelOrder:(req,res)=>{
        return new Promise((resolve, reject) => {
            userModel.updateOne({_id:req.params.user_id},{$pull:{orders:{order_id:parseInt(req.params.id)}}}).then(()=>{
                productModel.updateOne({_id:req.params.product_id},{$inc:{stockQuantity:req.params.quantity}})
                res.redirect('/admin/order_Details')
            })
        })
    }
}