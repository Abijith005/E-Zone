const { error404 } = require("../middleware/error")
const couponModel = require("../models/couponModel")

module.exports = {
    getCoupon: (req, res) => {
        return new Promise((resolve, reject) => {
            couponModel.find().lean().then((coupon) => {
                for (const i of coupon) {
                    i.startDate=(i.startDate).toLocaleString()
                    i.endDate=(i.endDate).toLocaleString()
                    req.session.date=i.startDate
                }
                let addCoupon;
                let editCoupon;
                let couponExpire
                if (req.session.editCoupon) {
                    editCoupon=req.session.editCoupon
                    editCoupon.startDate=new Date(editCoupon.startDate).toLocaleDateString()
                    editCoupon.endDate=new Date(editCoupon.endDate).toDateString()
                }
                else{
                    editCoupon=null
                }
                console.log(editCoupon);
                req.session.couponAdd == true ? addCoupon = true : addCoupon = false
                // req.session.couponExpire==true?couponExpire=true:couponExpire=false
                res.render('coupon', { coupon,addCoupon,editCoupon})
                req.session.couponAdd = false
                req.session.editCoupon=null
                // req.session.couponExpire=null
            })
        })
    },

    getAddCoupon: (req, res) => {
        req.session.couponAdd = true
        res.redirect('/admin/getCoupon')
    },

    addCoupon: (req, res) => {
        return new Promise((resolve, reject) => {
            couponModel.create({ ...req.body, couponStatus:true }).then((result) => {
                res.redirect('back')
            }).catch(() => {
                res.send(error404)
            })
        })
    },

    getEditCoupon: (req, res) => {
        return new Promise((resolve, reject) => {
            if (req.params.status=='edit') {
                couponModel.findById(req.params.id).then((result) => {
                    req.session.editCoupon=result
                    res.redirect('/admin/getCoupon')
                    resolve()
                
                }).catch(() => {
                    res.send(error404)
                })
            }
            else {
                couponModel.updateOne({_id:req.params.id,},{$set:{couponStatus:false}}).then(() => {
                    res.redirect('back')
                    resolve()
                }).catch(() => {
                    res.send(error404)
                })
            }
        })
    },

    editCoupon:(req,res)=>{
        return new Promise((resolve, reject) => {
            couponModel.findByIdAndUpdate(req.params.id,{...req.body}).then(()=>{
                res.redirect('back')
            })
        })
    }



}