const session = require("express-session")
const userModel = require("../models/userModel")
const userService = require("../services/userService")


module.exports={
    checkOutPage:(req,res)=>{
        userService.get_userDetails(req.session.userDetails._id).then((data)=>{
            orderDatas=req.session.orderDatas
            let sum = 0;
            orderDatas.forEach(item => {
                sum = sum + parseInt(item.price) * item.quantity
            })
            console.log(orderDatas);
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
            userModel.updateOne({_id:req.session.userDetails._id},{$push:{orders:data}}).then((result)=>{
                console.log(result);
                res.render('orderConfirm')
                resolve()
            })
        })
    }
}