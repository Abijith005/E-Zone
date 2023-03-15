const { now } = require('mongoose');
const { resolve } = require('promise');
const { error404 } = require('../middleware/error');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const adminService = require('../services/adminService')
var datas;
module.exports = {

    admin_loginPage: (req, res) => {
        res.render('admin_login')
    },

    admin_login: (req, res) => {
        adminService.adminLogin().then((data) => {
            if (req.body.admin_name == data.email && req.body.password == data.password) {
                req.session.admin = true;
                res.redirect('admin_home')
            }
            else
                res.redirect('/admin')
        }).catch(() => {
            res.send(error404)
        })
    },

    admin_home: async (req, res) => {
        let product = await userModel.aggregate([{ $unwind: '$orders' }, { $match: { 'orders.orderStatus': 'delivered' } }, { $group: { _id: { year: { $year: '$orders.orderDate' }, month: { $month: '$orders.orderDate' } }, revenue: { $sum: "$orders.totalOrderAmount" } } }, { $sort: { '_id.month': 1 } }])
        let totalOrder = await userModel.aggregate([{ $match: { orders: { $ne: [] } } }, { $group: { _id: null, count: { $sum: { $size: '$orders' } } } }])
        let paymentMethod = await userModel.aggregate([{ $unwind: '$orders' }, { $match: { 'orders.orderStatus': 'delivered' } }, {
            $group: {
                _id: null, cashOnDeliveryCount: { $sum: { $cond: { if: { $eq: ["$orders.paymentMethod", "Cash On Delivery"] }, then: 1, else: 0 } } }, onlinePaymentCount: {
                    $sum: {
                        $cond: { if: { $eq: ["$orders.paymentMethod", "UPI Payment"] }, then: 1, else: 0 }
                    }
                }
            }
        }])
        let totalProduct = await productModel.countDocuments()
        let totalRevenue = 0
        let monthlyRevenue = product.map(item => {
            totalRevenue = Number(totalRevenue) + Number(item.revenue, totalOrder)
            return item.revenue
        })
        let total = 0
        monthlyRevenue.forEach(item => {
            total = Number(total) + Number(item)
        })
        for (let i = monthlyRevenue.length; i <= 12; i++) {
            monthlyRevenue.push(0)
        }

        let totalStatus = {
            totalRevenue: total,
            totalOrder: totalOrder[0].count,
            totalProduct: totalProduct,
            paymentMethod: [paymentMethod[0].cashOnDeliveryCount, paymentMethod[0].onlinePaymentCount]
        }
        res.render('admin_home', { monthlyRevenue, totalStatus })
    },

    admin_product: (req, res) => {
        adminService.list_product().then((result) => {
            res.render('product', { result })
        }).catch(() => {
            res.send(error404)
        })
    },

    admin_userDetails: (req, res) => {
        adminService.user_details().then((result) => {
            if (datas) {
                result = datas
            }
            res.render('user_Details', { result })
            datas = null;
        }).catch(() => {
            res.send(error404)
        })
    },

    admin_orderDetails: (req, res) => {
        return new Promise((resolve, reject) => {
            userModel.find({ orders: { $ne: [] } }, { name: 1, orders: 1 }).lean().then(async (result) => {
                let date = result[0].orders[0].orderDate
                for (const i of result) {
                    for (const j of i.orders) {
                        await categoryModel.findOne({ _id: j.category }, { category: 1 }).then((data) => {
                            j.orderDate = j.orderDate.toLocaleString()
                            j.category = data.category
                            j.orderStatus == 'shipped' || j.orderStatus == 'delivered' ? j.shipped = true : j.shipped = false
                            j.orderStatus == 'delivered' ? j.delivered = true : j.delivered = false
                            j.orderStatus == 'returned' ? j.returnStatus = true : j.returnStatus = false
                        })
                    }
                }
                let singleOrderDetails = null
                if (req.session.singleOrderDetails) {
                    singleOrderDetails = req.session.singleOrderDetails
                    let product = await productModel.findOne({ _id: singleOrderDetails.product_id })
                    singleOrderDetails.brandName = product.brandName;
                    singleOrderDetails.productDetails = product.product_Details;
                    singleOrderDetails.price = product.price;
                    singleOrderDetails.image = product.image;
                }
                res.render('order_Details', { result, singleOrderDetails })
                req.session.singleOrderDetails = null
            })
            // .catch(()=>{
            //     res.send(error404)
            // }) 
        })
    },

    viewOrder: async (req, res) => {
        let user = await userModel.findOne({ orders: { $elemMatch: { order_id: req.params.id } } })
        let singleOrderDetails = await user.orders.find(e => e.order_id == req.params.id)
        req.session.singleOrderDetails = singleOrderDetails
        res.redirect('/admin/order_Details')
    },

    admin_userBlock: (req, res) => {
        adminService.block_user(req.params.id)
        res.redirect('/admin/user_Details')
    },

    admin_userUnblock: (req, res) => {
        adminService.unblock_user(req.params.id)
        res.redirect('/admin/user_Details')
    },


    admin_productEditPage: async (req, res) => {
        let data = await adminService.findToUpdate(req.params.id, productModel)
        // let result=await adminService.list_productOrCategory(categoryModel)
        let result = await categoryModel.find().sort({ name: 1 }).lean()
        res.render('edit_product', { data, result })
    },

    admin_productEdit: async (req, res) => {
        adminService.update_product(req.params.id, req.body, req.files)
        res.redirect('/admin/admin_products')
    },

    deleteImage: (req, res) => {
        productModel.updateOne({ _id: req.params.id }, { $pull: { sub_image: { filename: req.params.fileName } } }).then((result) => {
            res.json({ success: true })
        })
    },

    admin_productAddPage: (req, res) => {
        return new Promise(async (resolve, reject) => {
            let result = await categoryModel.find({}).lean()
            // let result=await categoryModel.find({},{brandName:0}).lean()
            // let brandName=req.session.brandForProduct
            // res.render('add_product', { result,brandName })
            // brandName=null
            res.render('add_product', { result })

        })
    },

    getBrands: async (req, res) => {
        let brand= await categoryModel.find({ category: req.params.category }, { brandName: 1, _id: 0 })
        let brands=brand[0].brandName
        res.json({ brands })
    },

    admin_productAdd: (req, res) => {
        adminService.add_product(req.body, req.files).then(() => {
            res.redirect('/admin/admin_products')
        }).catch(() => {
            res.send(error404)
        })
    },
    admin_productFlag: (req, res) => {
        adminService.flag_product(req.params.id)
        res.redirect('/admin/admin_products')
    },

    admin_productUnflag: (req, res) => {
        adminService.unflag_product(req.params.id)
        res.redirect('/admin/admin_products')
    },

    admin_userSearch: (req, res) => {
        adminService.user_search(req.body).then((result) => {
            datas = result;
            res.redirect('/admin/user_Details')
        })
    },

    getCoupon: (req, res) => {

    },

    adminLogOut: (req, res) => {
        req.session.destroy()
        res.redirect('/admin')
    },

    getSalesReport: async (req, res) => {
        if (req.session.salesReport) {
            let products = req.session.salesReport.products
            products.startDate = new Date(req.session.salesReport.startDate).toLocaleDateString()
            products.endDate = new Date(req.session.salesReport.endDate).toLocaleDateString()
            let totalRevenue = 0;
            for (const i of products) {
                totalRevenue = Number(totalRevenue) + Number(i.orders.totalOrderAmount);
            }
            products.totalRevenue = totalRevenue
            res.render('salesReport', { products })
            req.session.salesReport = null
        }
        else {
            let thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            thirtyDaysAgo = thirtyDaysAgo.toISOString()
            let products = await userModel.aggregate([{ $unwind: '$orders' }, { $match: { $and: [{ 'orders.orderStatus': 'delivered' }, { 'orders.orderDate': { $gte: new Date(thirtyDaysAgo), $lte: new Date() } }] } }])
            let totalRevenue = 0;
            for (const i of products) {
                totalRevenue = Number(totalRevenue) + Number(i.orders.totalOrderAmount);
            }
            products.thirtyDays = true
            products.totalRevenue = totalRevenue
            res.render('salesReport', { products })
        }
    },

    salesReport: async (req, res) => {
        let startDate = new Date(req.body.startDate).toISOString()
        let endDate = new Date(req.body.endDate).toISOString()
        let products = await userModel.aggregate([{ $unwind: '$orders' }, { $match: { $and: [{ 'orders.orderStatus': 'delivered' }, { 'orders.orderDate': { $gte: new Date(startDate), $lte: new Date(endDate) } }] } }])
        // let startDate = new Date(req.body.startDate).getDate()
        // let endDate = new Date(req.body.endDate).getDate()
        // let user = await userModel.find({ orders: { $ne: [] } }, { name: 1, orders: 1 }).lean()
        // let products = []
        // let a = {}
        // let orders = []
        // for (const i of user) {
        //     a.name = i.name;
        //     a.user_id = i._id;
        //     for (const j of i.orders) {
        //         if (j.orderStatus == 'delivered' && j.orderDate >= startDate && j.orderDate.getTime() <= endDate) {
        //             orders.push(j)
        //         }
        //     }
        //     a.orders = orders;
        //     products.push(a)
        //     a = {}
        //     orders = []
        // }
        // let totalRevenue = 0;
        // for (const i of products) {
        //     for (const j of i.orders) {
        //         totalRevenue = Number(totalRevenue) + Number(j.totalOrderAmount);
        //     }
        // }
        req.session.salesReport = { products, startDate, endDate }
        // req.session.salesReport.startDate=req.body.startDate
        // req.session.salesReport.endDate=req.body.endDate
        res.redirect('/admin/getSalesReport')
    }
}