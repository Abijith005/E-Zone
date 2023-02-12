const categoryModel = require('../models/categoryModel');
// const collections = require('../models/collections');
const adminService = require('../services/adminService')



module.exports = {


    admin_categoryPage: (req, res) => {
        return new Promise(async (resolve, reject) => {
            await categoryModel.find().lean().then((result) => {
                res.render('category', { result })

            })
        })

    },

    admin_addCategoryPage: (req, res) => {
        let data
        req.session.categoryDetails ? data = req.session.categoryDetails : data = null
        res.render('add_category', { data })
        req.session.categoryDetails = null

        
    },


    // categoryForProduct:(req,res)=>{
// return new Promise((resolve, reject) => {
//     categoryModel.findOne({category:req.body.category}).then((result)=>{
//         req.session.brandForProduct=result.brandName
//         res.redirect('/admin/product_add')
        
//     })
// })
//     },


    admin_addCategory: (req, res) => {
        let { category, brandName } = req.body
        brandName = brandName.split(',')
        adminService.addCategory({ category, brandName })
        res.redirect('/admin/category')

    },

    flagAndUnflag_category: (req, res) => {
        adminService.flag_or_unflagCategory(req.params.id).then(() => {
            res.redirect('/admin/category')
        })

    },

    edit_category: (req, res) => {
        return new Promise(async(resolve, reject) => {
            await categoryModel.findOne({_id:req.params.id}).then((result)=>{
                req.session.categoryDetails = result
                res.redirect('/admin/add_categoryPage')
            })
        })
    },

    update_category: (req, res) => {
        adminService.categoryUpdate(req.params.id, req.body)
        res.redirect('/admin/category')

       
    },
}