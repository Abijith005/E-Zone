const { now, set } = require('mongoose');
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
            res.render('404')
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
        let totalUsers = await userModel.countDocuments()
        let totalRevenue = 0
        let revenue = product.map(item => {
            totalRevenue = Number(totalRevenue) + Number(item.revenue, totalOrder)
            return {revenue:item.revenue,month:item._id.month}
        })
        let total = 0
        revenue.forEach(item => {
            total = Number(total) + Number(item.revenue)
        })
        const monthlyRevenue=[]
        for (let i = 1; i <= 12; i++) {
           const month=revenue.find(e=>e.month==i)
            if (month) {
                monthlyRevenue.push(month.revenue)
            } else {
                monthlyRevenue.push(0)
            }
        }
        let totalStatus = {
            totalRevenue:Math.ceil(total),
            totalOrder: totalOrder[0]?.count ?? 0,
            totalProduct: totalProduct,
            totalUsers: totalUsers,
            totalCod: paymentMethod[0]?.cashOnDeliveryCount ?? 0,
            totalUPI: paymentMethod[0]?.onlinePaymentCount ?? 0,
            paymentMethod: [paymentMethod[0]?.onlinePaymentCount ?? 0,paymentMethod[0]?.cashOnDeliveryCount ?? 0]
        }
        res.render('adminHome', { monthlyRevenue, totalStatus })
    },

    admin_product: (req, res) => {
        adminService.list_product().then((result) => {
            res.render('product', { result })
        }).catch(() => {
            res.render('404')
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
            res.render('404')
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
                            j.totalOrderAmount=Math.ceil(j.totalOrderAmount)
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
                    singleOrderDetails.totalOrderAmount=Math.ceil(singleOrderDetails.totalOrderAmount)
                    
                }
                res.render('order_Details', { result, singleOrderDetails })
                req.session.singleOrderDetails = null
            })
                .catch(() => {
                    res.render('404')
                })
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
            res.render('add_product', { result })

        })
    },

    getBrands: async (req, res) => {
        let brand = await categoryModel.find({ category: req.params.category }, { brandName: 1, _id: 0 })
        let brands = brand[0].brandName
        res.json({ brands })
    },

    admin_productAdd: (req, res) => {
        adminService.add_product(req.body, req.files).then(() => {
            res.redirect('/admin/admin_products')
        }).catch(() => {
            res.render('404')
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
        let thirtyDaysAgo =new Date(new Date().setDate(new Date().getDate()-30))
        let products = await userModel.aggregate([{ $unwind: '$orders' }, { $match: { $and: [{ 'orders.orderStatus': 'delivered' }, { 'orders.orderDate': { $gte: new Date(thirtyDaysAgo), $lte: new Date() } }] } }])
        let totalRevenue = 0;
        for (const i of products) {
            i.orders.orderDate = new Date(i.orders.orderDate).toLocaleDateString()
            i.orders.totalOrderAmount=Math.ceil(i.orders.totalOrderAmount)
            totalRevenue = Number(totalRevenue) + Number(i.orders.totalOrderAmount);
        }
        products.thirtyDays = true
        products.totalRevenue = Math.ceil(totalRevenue)
        products.salesCount=products.length
        const uniqueUsers=new Set(products.map(e=>e._id.toString()));
        products.userCount=uniqueUsers.size
        res.render('salesReport', { products })
    },

    salesReport: async (req, res) => {
        let startDate = new Date(req.body.startDate)
        let endDate = new Date(req.body.endDate)
        startDate.setHours(0,0,0,0)
        endDate.setHours(24,0,0,0)
        let products = await userModel.aggregate([{ $unwind: '$orders' }, { $match: { $and: [{ 'orders.orderStatus': 'delivered' }, { 'orders.orderDate': { $gte: new Date(startDate), $lte: new Date(endDate) } }] } }])
        let totalRevenue = 0;
        for (const i of products) {
            i.orders.orderDate = new Date(i.orders.orderDate).toLocaleDateString()
            i.orders.totalOrderAmount=Math.ceil(i.orders.totalOrderAmount)
            totalRevenue = Number(totalRevenue) + Number(i.orders.totalOrderAmount);
        }
        products = { products,totalRevenue }
        res.json({ products })
    }
}