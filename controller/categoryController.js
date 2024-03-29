const categoryModel = require('../models/categoryModel');
const userModel = require('../models/userModel');
// const collections = require('../models/collections');
const adminService = require('../services/adminService')



module.exports = {


    admin_categoryPage: (req, res) => {
        return new Promise(async (resolve, reject) => {
            await categoryModel.find().lean().then((result) => {
                res.render('category', { result })
            }).catch(()=>{
                res.render('404')
            })
        })
    },
 
    admin_addCategoryPage: (req, res) => {
        let data
        req.session.categoryDetails ? data = req.session.categoryDetails : data = null
        res.render('add_category', { data })
        req.session.categoryDetails = null
    },

    admin_addCategory: (req, res) => {
        let { category, brandName } = req.body
        brandName = brandName.split(',')
        adminService.addCategory({ category, brandName })
        res.redirect('/admin/category')
    },

    flagAndUnflag_category: (req, res) => {
        adminService.flag_or_unflagCategory(req.params.id).then(() => {
            res.redirect('/admin/category')
        }).catch(()=>{
            res.render('404')
        })
    },

    edit_category: (req, res) => {
        return new Promise(async(resolve, reject) => {
            await categoryModel.findOne({_id:req.params.id}).then((result)=>{
                req.session.categoryDetails = result
                res.redirect('/admin/add_categoryPage')
            }).catch(()=>{
                res.render('404')
            })
        })
    },

    update_category: (req, res) => {
        adminService.categoryUpdate(req.params.id, req.body)
        res.redirect('/admin/category')
    },

   
}