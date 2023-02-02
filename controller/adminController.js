const adminService = require('../services/adminService')
var datas;
module.exports = {

    admin_loginPage: (req, res) => {
        res.render('admin_login')
    },

    admin_login: (req, res) => {
        adminService.adminLogin().then((data) => {
            if (req.body.admin_name == data.email && req.body.password == data.password) {
                res.redirect('admin_home')
            }
            else
                res.redirect('/admin')
        })
    },

    admin_home: (req, res) => {
        res.render('admin_home')
    },
    admin_product: (req, res) => {
        adminService.list_product().then((result) => {
            res.render('product', { result })
        })
    },

    admin_userDetails: (req, res) => {
        adminService.user_details().then((result) => {
            if (datas) {
                result = datas
            }

            res.render('user_Details', { result })
            datas = null;
        })
    },

    admin_orderDetails: (req, res) => {
        res.render('order_Details')
    },

    admin_userBlock: (req, res) => {
        adminService.block_user(req.params)
        res.redirect('/admin/user_Details')

    },

    admin_userUnblock: (req, res) => {
        adminService.unblock_user(req.params)
        res.redirect('/admin/user_Details')
    },

    admin_productEditPage: async (req, res) => {
        let data = await adminService.findToUpdate(req.params)
        res.render('edit_product', { data })
    },

    admin_productEdit: async (req, res) => {
        adminService.update_product(req.params.id, req.body, req.files)
        res.redirect('/admin/admin_products')

    },

    admin_productAddPage: (req, res) => {
        res.render('add_product')
    },

    admin_productAdd: (req, res) => {
        adminService.add_product(req.body, req.files)
        res.redirect('/admin/admin_products')
    },
    admin_productFlag: (req, res) => {
        adminService.flag_product(req.params)
        res.redirect('/admin/admin_products')
    },

    admin_productUnflag: (req, res) => {
        adminService.unflag_product(req.params)
        res.redirect('/admin/admin_products')
    },

    admin_userSearch: (req, res) => {
        adminService.user_search(req.body).then((result) => {
            datas = result;
            res.redirect('/admin/user_Details')
        })
    },

    admin_categoryPage: (req, res) => {
        res.render('category')
    },

    admin_addCategoryPage: (req, res) => {
        res.render('add_category')
    },

    admin_addCategory:(req,res)=>{
        res.send(req.body)
    }





}