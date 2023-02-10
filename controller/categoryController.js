const categoryModel = require('../models/categoryModel');
// const collections = require('../models/collections');
const adminService = require('../services/adminService')



module.exports = {


    admin_categoryPage: (req, res) => {
        // if (req.session.admin) {
        adminService.list_productOrCategory(categoryModel).then((result) => {
            res.render('category', { result })

        })

        // } else {
        //     res.redirect('/admin')

        // }
    },

    admin_addCategoryPage: (req, res) => {
        // if (req.session.admin) {
        let data
        req.session.categoryDetails ? data = req.session.categoryDetails : data = null
        res.render('add_category', { data })
        req.session.categoryDetails = null

        // } else {
        //     res.redirect('/admin')

        // }
    },


    admin_addCategory: (req, res) => {
        // if (req.session.admin) {
        let { category, brandName } = req.body
        brandName = brandName.split(',')
        adminService.addCategory( {category, brandName })
        res.redirect('/admin/category')

        // } else {
        //     res.redirect('/admin')

        // }
    },

    flagAndUnflag_category: (req, res) => {
        // if (req.session.admin) {
        adminService.flag_or_unflagCategory(req.params.id).then(() => {
            res.redirect('/admin/category')
        })

        // } else {
        //     res.redirect('/admin')

        // }
    },

    edit_category: (req, res) => {
        // if (req.session.admin) {
        adminService.findToUpdate(req.params.id, categoryModel).then((result) => {
            req.session.categoryDetails = result
            res.redirect('/admin/add_categoryPage')
        })
        // } else {
        //     res.redirect('/admin')

        // }
    },

    update_category: (req, res) => {
        // if (req.session.admin) {
        adminService.categoryUpdate(req.params.id, req.body)
        res.redirect('/admin/category')

        // } else {
        //     res.redirect('/admin')

        // }
    },
}