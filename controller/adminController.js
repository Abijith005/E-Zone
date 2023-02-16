const { resolve } = require('promise');
const categoryModel = require('../models/categoryModel');
// const collections = require('../models/collections');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
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

            adminService.list_product().then((result) => {
                res.render('product', { result })
            })
        
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
        return new Promise((resolve, reject) => {
            userModel.find({orders:{$ne:null}},{name:1,orders:1}).lean().then((result)=>{
                for (const i of result) {
                    for (const j of i.orders) {
                        categoryModel.findOne({_id:j.category},{category:1}).then((result)=>{
                            j.category=result.category
                        })
                    }
                }
                res.render('order_Details',{result}) 
            
            })
        })
    },

    admin_userBlock: (req, res) => {

            adminService.block_user(req.params.id)
            res.redirect('/admin/user_Details')
       

    },

    admin_userUnblock: (req, res) => {
        // if (req.session.admin) {

            adminService.unblock_user(req.params.id)
            res.redirect('/admin/user_Details')
        // } else {
            // res.redirect('/admin')

        // }
    },


    admin_productEditPage: async (req, res) => {

        // if (req.session.admin) {
            let data = await adminService.findToUpdate(req.params.id, productModel)
            // let result=await adminService.list_productOrCategory(categoryModel)
            let result = await categoryModel.find().sort({ name: 1 }).lean()
        
            // resolve(result)

            res.render('edit_product', { data,result})

        // } else {
            // res.redirect('/admin')

        // }

    },

    admin_productEdit: async (req, res) => {
        // if (req.session.admin) {
            adminService.update_product(req.params.id, req.body, req.files)
            res.redirect('/admin/admin_products')

    },

    admin_productAddPage:(req, res) => {
        return new Promise(async(resolve, reject) => {
            let result=await categoryModel.find({}).lean()
            // let result=await categoryModel.find({},{brandName:0}).lean()
            // let brandName=req.session.brandForProduct
                // res.render('add_product', { result,brandName })
                // brandName=null
                res.render('add_product', { result})
        
        })


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
            adminService.flag_product(req.params.id)
            res.redirect('/admin/admin_products')

        // } else {
            // res.redirect('/admin')

        // }
    },

    admin_productUnflag: (req, res) => {
        // if (req.session.admin) {
            adminService.unflag_product(req.params.id)
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