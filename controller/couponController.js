const { error404 } = require("../middleware/error")
const couponModel = require("../models/couponModel")
const moment = require('moment')

module.exports = {
    getCoupon: (req, res) => {
        return new Promise((resolve, reject) => {
            couponModel.find().lean().then((coupon) => {
                for (const i of coupon) {
                    i.startDate = (i.startDate).toLocaleString()
                    i.endDate = (i.endDate).toLocaleString()
                    req.session.date = i.startDate
                }
                let addCoupon;
                let editCoupon;
                let couponExpire
                if (req.session.editCoupon) {
                    editCoupon = req.session.editCoupon
                    editCoupon.startDate = moment(editCoupon.startDate).utc().format("YYYY-MM-DD");
                    editCoupon.endDate = moment(editCoupon.endDate).utc().format("YYYY-MM-DD")
                }
                else {
                    editCoupon = null
                }
                req.session.couponAdd == true ? addCoupon = true : addCoupon = false
                // req.session.couponExpire==true?couponExpire=true:couponExpire=false
                res.render('coupon', { coupon, addCoupon, editCoupon })
                req.session.couponAdd = false
                req.session.editCoupon = null
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
            couponModel.find({couponCode:new RegExp(req.body.couponCode)}).then(async(result)=>{
                if (result==null) {
                 await couponModel.create({ ...req.body, couponStatus: true })
                 res.redirect('back')
                }
                else{
                    res.json({couponExist:true})
                }
            }).catch(() => {
                res.send(error404)
            })
        })
    },

    getEditCoupon: (req, res) => {
        return new Promise((resolve, reject) => {
            if (req.params.status == 'edit') {
                couponModel.findById(req.params.id).then((result) => {
                    req.session.editCoupon = result
                    res.redirect('/admin/getCoupon')
                    resolve()

                }).catch(() => {
                    res.render('404')
                })
            }
            else {
                couponModel.updateOne({ _id: req.params.id, }, { $set: { couponStatus: false } }).then(() => {
                    res.redirect('back')
                    resolve()
                }).catch(() => {
                    res.render('404')
                })
            }
        })
    },

    editCoupon: (req, res) => {
        return new Promise(async(resolve, reject) => {
            let date = new Date(req.body.endDate)
            if (date < new Date() || req.body.couponStatus == 'Expired') {
                req.body.couponStatus = false
            }
            else {
                req.body.couponStatus = true
            }
            let id = req.body.id
            delete req.body.id
            await couponModel.findByIdAndUpdate(id, { ...req.body })
            res.redirect('back')
        })
    }


}