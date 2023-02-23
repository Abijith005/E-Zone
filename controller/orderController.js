const session = require("express-session")
const { default: createId } = require("../middleware/createId")
const couponModel = require("../models/couponModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const userService = require("../services/userService")


module.exports = {
    checkOutPage:(req, res) => {
        userModel.findOne({ _id: req.session.userDetails._id }, { user_cart: 1 }).then((cart) => {
            if (cart.user_cart.length > 0) {
                userService.get_userDetails(req.session.userDetails._id).then(async(data) => {
                    orderDatas = await userService.cartProductDatas(req.session.userDetails._id)
                    let sum = 0;
                    orderDatas.forEach(item => {
                        sum = sum + parseInt(item.price) * item.quantity
                    })
                    req.session.totalAmount=sum
                    orderDatas.totalAmount = sum
                    req.session.selectAddress ? selectAddress = req.session.selectAddress : selectAddress = null
                    req.session.changeAddress ? changeAddress = true : changeAddress = false
                    data.address.length >= 3 ? maxAddress = true : maxAddress = false
                    req.session.editCheckOutAddress ? edit = req.session.editCheckOutAddress : edit = null
                    req.session.checkOutAddAddress ? addAddress = true : addAddress = false
                    res.render('checkOutPage', { orderDatas, data, changeAddress, addAddress, maxAddress, edit, selectAddress })
                    req.session.changeAddress = false
                    req.session.checkOutAddAddress = false
                    req.session.editCheckOutAddress = null
                    req.session.selectAddress = null
                    edit = null
                    addAddress = false
                })

            }
            else {
                res.redirect('/cart')
            }
        }).catch(() => {
            res.send(error404)
        })
    },


    changeAddress: (req, res) => {
        return new Promise((resolve, reject) => {
            req.session.changeAddress = true
            res.redirect('/checkOutPage')
        })
    },

    checkOutAddAddressPage: (req, res) => {
        return new Promise((resolve, reject) => {
            req.session.checkOutAddAddress = true
            res.redirect('/changeAddress')
        })
    },

    checkOutAddAddress: (req, res) => {
        return new Promise((resolve, reject) => {
            userService.user_addAddress(req.session.userDetails._id, req.body).then(() => {
                res.redirect('/changeAddress')
            })
        })
    },

    deleteCheckOutAddress: (req, res) => {
        return new Promise((resolve, reject) => {
            userService.user_delete_address(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
                res.redirect('/changeAddress')
            })
        })
    },

    editCheckOutAddress: (req, res) => {
        return new Promise((resolve, reject) => {
            userService.getAddress(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
                req.session.editCheckOutAddress = result;
                res.redirect('/checkOutAddAddress')
            })
        })
    },

    updateCheckOutAddress: (req, res) => {
        return new Promise((resolve, reject) => {
            userService.addressUpdate(parseInt(req.params.id), req.body).then(() => {
                res.redirect('/changeAddress')
            })
        })
    },

    selectAddress: (req, res) => {
        return new Promise((resolve, reject) => {
            userService.getAddress(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
                req.session.selectAddress = result;
                res.redirect('/checkOutPage')
            })
        })
    },

    placeOrder: (req, res) => {
        return new Promise((resolve, reject) => {
            let data = req.body
            if (Array.isArray(data.products_id)) {
                for (let i = 0; i < data.products_id.length; i++) {
                    let amount = data.price[i] * data.quantity[i]
                    orderId = Date.now()
                    userModel.updateOne({ _id: req.session.userDetails._id }, { $push: { orders: { order_id: orderId, deliveryAddress: data.deliveryAddress, paymentMethod: data.paymentMethod, product_id: data.products_id[i], productName: data.productsName[i], category: data.category[i], quantity: data.quantity[i], couponStatus: data.couponStatus, totalAmount: amount, orderDate: Date(), orderStatus: 'Not Delivered' } } }).then(() => {
                        resolve()
                    })
                }
            }
            else {
                let amount = data.price * data.quantity
                orderId = Date.now()
                userModel.updateOne({ _id: req.session.userDetails._id }, { $push: { orders: { order_id: orderId, deliveryAddress: data.deliveryAddress, paymentMethod: data.paymentMethod, product_id: data.products_id, productName: data.productsName, category: data.category, quantity: data.quantity, couponStatus: data.couponStatus, totalAmount: amount, orderDate: Date(), orderStatus: 'Not Delivered' } } }).then((result) => {
                    resolve()
                })
            }
            userModel.updateOne({ _id: req.session.userDetails._id }, { $unset: { user_cart: {} } }).then(() => {
                res.render('orderConfirm')
                resolve()
            })
        })
    },

    adminOrderUpdate: (req, res) => {
        return new Promise((resolve, reject) => {
            if (req.params.update == 'cancel') {
                userModel.updateOne({ _id: req.params.user_id, orders: { $elemMatch: { order_id: parseInt(req.params.id) } } }, { $set: { 'orders.$.orderStatus': 'cancelled' } }).then(() => {
                    productModel.updateOne({ _id: req.params.product_id }, { $inc: { stockQuantity: req.params.quantity } }).then((result) => {
                        res.redirect('/admin/order_Details')
                    })
                }).catch(() => {
                    res.send(error404)
                })
            }
            else {
                userModel.updateOne({ _id: req.params.user_id, orders: { $elemMatch: { order_id: parseInt(req.params.id) } } }, { $set: { 'orders.$.orderStatus': 'Delivered' } }).then((result) => {
                    res.redirect('/admin/order_Details')
                }).catch(() => {
                    res.send(error404)
                })
            }
        })
    },

    userOrderUpdate: (req, res) => {
        userModel.updateOne({ _id: req.session.userDetails._id, orders: { $elemMatch: { order_id: parseInt(req.params.id) } } }, { $set: { 'orders.$.orderStatus': 'cancelled' } }).then((result) => {
            productModel.updateOne({ _id: req.params.product_id }, { $inc: { stockQuantity: req.params.quantity } }).then((result) => {
                res.redirect('/orderHistory')
            })
        }).catch(() => {
            res.send(error404)
        })
    },

    couponApply: (req, res) => {
        couponModel.findOne({ couponCode: req.body.couponCode }).then((result) => {
            if(result.startDate.getTime()<new Date().getTime()&&result.endDate.getTime()>new Date().getTime()&&req.body.totalAmount>=result.minPurchaseAmount){
                let discountedAmount=req.session.totalAmount-result.discountAmount;
                res.json({...result,totalAmount:discountedAmount, success: true})
            }
            else{
                res.json()

            }
        })
    }


}