const { Result } = require("express-validator");
const bannerModel = require("../models/bannerModel")
const categoryModel = require("../models/categoryModel")

module.exports = {

    getBanner: async (req, res) => {
        let banners = await bannerModel.find().lean()
        console.log(banners);
        res.render('banner', { banners })
    },

    addBanner: async (req, res) => {
        let category = await categoryModel.find({}, { category: 1, _id: 0 }).lean()
        res.render('addBanner', { category })
    },

    postAddBanner: (req, res) => {
        let data = req.body
        let file = req.files
        bannerModel.create({ ...data, ...file })
        res.redirect('/admin/getBanner')
    },

    getBannerUpdate: async (req, res) => {
        let id = req.query.id
        if (req.query.cond == 'Edit') {
            let category = await categoryModel.find({}, { category: 1, _id: 0 }).lean()
            let banner = await bannerModel.findOne({ _id:id }).lean()
            banner = {
                ...banner,
                category: category
            }
            res.render('editBanner', { banner })
        } else {
            bannerModel.deleteOne({ _id:id }).then((Result) => {
                res.redirect('/admin/getBanner')
            })
        }
    },

    flagUnFlag: (req, res) => {
        let id=req.params.id
        if (req.params.cond=='flag') {
            bannerModel.updateOne({_id:id }, { $set: { flag: true } }).then((result)=>{
                res.redirect('/admin/getBanner')})
        } else {
            bannerModel.updateOne({ _id:id }, { $set: { flag: false } }).then((result)=>{
                res.redirect('/admin/getBanner')})
        }
    },

    postBannerUpdate: (req, res) => {
        let id = req.body.id
        let data = req.body
        let file = req.files
        delete data.id;
        bannerModel.updateOne({ _id:id }, { $set: { ...data, ...file } }).then((result) => {
            res.redirect('/admin/getBanner')
        })
    }
} 