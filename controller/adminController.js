const { resolve } = require('promise');
const collections = require('../models/collections');
const adminService = require('../services/adminService')
var datas;
module.exports = {

    admin_loginPage: (req, res) => {
        // if (req.session.admin) {
        //     res.redirect('admin/admin_home')
        // } else {

            res.render('admin_login')
        // }
    },

    admin_login: (req, res) => {
        adminService.adminLogin().then((data) => {
            if (req.body.admin_name == data.email && req.body.password == data.password) {
                req.session.admin = true;
                res.redirect('admin_home')
            }
            else
                res.redirect('/admin')
        })
    },

    admin_home: (req, res) => {
        // if (req.session.admin) {
            res.render('admin_home')
        // } else {
            // res.redirect('/admin')

        // }
    },
    admin_product: (req, res) => {
        // if (req.session.admin) {

            adminService.list_productOrCategory(collections.PRODUCT_COLLECTION).then((result) => {
                res.render('product', { result })
            })
        // } else {
            // res.redirect('/admin')
        // }
    },

    admin_userDetails: (req, res) => {
        // if (req.session.admin) {

            adminService.user_details().then((result) => {
                if (datas) {
                    result = datas
                }

                res.render('user_Details', { result })
                datas = null;
            })
        // } else {
            // res.redirect('/admin')

        // }


    },

    admin_orderDetails: (req, res) => {

        // if (req.session.admin) {

            res.render('order_Details')
        // } else {
            // res.redirect('/admin')

        // }
    },

    admin_userBlock: (req, res) => {
        // if (req.session.admin) {

            adminService.block_user(req.params)
            res.redirect('/admin/user_Details')
        // } else {
            // res.redirect('/admin')

        // }

    },

    admin_userUnblock: (req, res) => {
        // if (req.session.admin) {

            adminService.unblock_user(req.params)
            res.redirect('/admin/user_Details')
        // } else {
            // res.redirect('/admin')

        // }
    },


    admin_productEditPage: async (req, res) => {

        // if (req.session.admin) {
            let data = await adminService.findToUpdate(req.params, collections.PRODUCT_COLLECTION)
            let result=await adminService.list_productOrCategory(collections.CATEGORY_COLLECTION)
            res.render('edit_product', { data,result})

        // } else {
            // res.redirect('/admin')

        // }

    },

    admin_productEdit: async (req, res) => {
        // if (req.session.admin) {
            console.log(req.files);
            adminService.update_product(req.params.id, req.body, req.files)
            res.redirect('/admin/admin_products')

        // } else {
            // res.redirect('/admin')

        // }

    },

    admin_productAddPage: (req, res) => {
        // if (req.session.admin) {
            adminService.list_productOrCategory(collections.CATEGORY_COLLECTION).then((result) => {
                res.render('add_product', { result })

            })

        // } else {
            // res.redirect('/admin')

        // }
    },

    admin_productAdd: (req, res) => {
        // if (req.session.admin) {
            adminService.add_product(req.body, req.files)
            res.redirect('/admin/admin_products')

        // } else {
            // res.redirect('/admin')

        // }
    },
    admin_productFlag: (req, res) => {

        // if (req.session.admin) {
            adminService.flag_product(req.params)
            res.redirect('/admin/admin_products')

        // } else {
            // res.redirect('/admin')

        // }
    },

    admin_productUnflag: (req, res) => {
        // if (req.session.admin) {
            adminService.unflag_product(req.params)
            res.redirect('/admin/admin_products')

        // } else {
            // res.redirect('/admin')

        // }

    },

    admin_userSearch: (req, res) => {
        // if (req.session.admin) {

            adminService.user_search(req.body).then((result) => {
                datas = result;
                res.redirect('/admin/user_Details')
            })
        // } else {
            // res.redirect('/admin')

        // }

    },


    adminLogOut: (req, res) => {
        // if (req.session.admin) {
            req.session.destroy()
            res.redirect('/admin')
        // } else {
        //     res.redirect('/admin')

        // }
    }





}