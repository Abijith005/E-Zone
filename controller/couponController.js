const { error404 } = require("../middleware/error")
const couponModel = require("../models/coupomModel")

module.exports={
    getCoupon:(req,res)=>{
        return new Promise((resolve, reject) => {
            couponModel.find().lean().then((coupon)=>{
                let addCoupon
                req.session.couponAdd==true?addCoupon=true:addCoupon=false
                res.render('coupon',{coupon,addCoupon})
                req.session.couponAdd=false     
            })
        })
    },

    getAddCoupon:(req,res)=>{
        req.session.couponAdd=true
        res.redirect('/admin/getCoupon')
    },

    addCoupon:(req,res)=>{
        console.log(req.body);
        return new Promise((resolve, reject) => {
            couponModel.create({...req.body,couponStatus:'active'}).then((result)=>{
                console.log(result);
                res.redirect('back')
            // }).catch(()=>{
            //     res.send(error404)
            })
        })
    }

}