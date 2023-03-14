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
            let banner = await bannerModel.findOne({ id }).lean()
            banner = {
                ...banner,
                category: category
            }
            res.render('editBanner', { banner })
        } else {
            bannerModel.deleteOne({ id }).then((Result) => {
                res.redirect('/admin/getBanner')
            })
        }
    },

    flagUnFlag: (req, res) => {
        let id=req.params.id
        console.log(id);
        if (req.params.cond=='flag') {
            console.log('hlooo');
            bannerModel.updateOne({ id }, { $set: { flag: true } }).then((result)=>{
                res.redirect('/admin/getBanner')})
        } else {
            console.log('haiiiiiiiiii');
            bannerModel.updateOne({ id }, { $set: { flag: false } }).then((result)=>{
                res.redirect('/admin/getBanner')})
        }
    },

    postBannerUpdate: (req, res) => {
        let id = req.body.id
        let data = req.body
        let file = req.files
        delete data.id;
        console.log();
        bannerModel.updateOne({ id }, { $set: { ...data, ...file } }).then((result) => {
            res.redirect('/admin/getBanner')
        })
    }
} 