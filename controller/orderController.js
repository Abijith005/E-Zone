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
            orderDatas.totalAmount=sum
            res.render('checkOutPage',{orderDatas,data})
        })
        // req.session.orderDatas=null
    },

    selectAddress:(req,res)=>{
        res.render('chooseAddress')
    }
}