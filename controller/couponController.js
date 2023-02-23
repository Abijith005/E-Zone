const { error404 } = require("../middleware/error")
const couponModel = require("../models/coupomModel")

module.exports = {
    getCoupon: (req, res) => {
        return new Promise((resolve, reject) => {
            couponModel.find().lean().then((coupon) => {
                let addCoupon;
                let editCoupon;
                let couponExpire
                req.session.editCoupon?editCoupon=req.session.editCoupon:editCoupon=null
                req.session.couponAdd == true ? addCoupon = true : addCoupon = false
                // req.session.couponExpire==true?couponExpire=true:couponExpire=false
                console.log(editCoupon);
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
        console.log(req.body);
        return new Promise((resolve, reject) => {
            couponModel.create({ ...req.body, couponStatus: 'active' }).then((result) => {
                console.log(result);
                res.redirect('back')
            }).catch(() => {
                res.send(error404)
            })
        })
    },

    getEditCoupon: (req, res) => {
        console.log("started");
        return new Promise((resolve, reject) => {
            if (req.params.status=='edit') {
                console.log('if cndtn');
                couponModel.findById(req.params.id).then((result) => {
                    req.session.editCoupon=result
                    res.redirect('/admin/getCoupon')
                    resolve()
                
                }).catch(() => {
                    res.send(error404)
                })
            }
            else {
                console.log(req.params.id);
                couponModel.updateOne({_id:req.params.id,},{$set:{couponStatus:'ended'}}).then((result) => {
                    // req.session.couponExpire=true
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
            couponModel.findByIdAndUpdate(req.params.id,{...req.body})
        })
    }



}