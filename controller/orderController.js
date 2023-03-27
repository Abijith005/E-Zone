const session = require("express-session")
const { createId } = require("../middleware/createId")
const couponModel = require("../models/couponModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const userService = require("../services/userService")
const uniqueid = require('uniqid')


module.exports = {
    checkOutPage: (req, res) => {
        userModel.findOne({ _id: req.session.userDetails._id }, { user_cart: 1 }).then((cart) => {
            if (cart.user_cart.length > 0) {
                userService.get_userDetails(req.session.userDetails._id).then(async (data) => {
                    orderDatas = await userService.cartProductDatas(req.session.userDetails._id)
                    let sum = 0;
                    orderDatas.forEach(item => {
                        sum = sum + parseInt(item.price) * item.quantity
                    })
                    req.session.discountedAmount = sum
                    req.session.totalAmount = sum
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
            res.render('404')
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
        return new Promise(async (resolve, reject) => {
            let data = req.body
            let walletDebit = parseInt(req.body.walletDebit)
            let { user_cart } = await userModel.findOne({ _id: req.session.userDetails._id }, { user_cart: 1, _id: 0 })
            let numberOfOrders = user_cart.length
            let discount = data.discount ? data.discount / numberOfOrders : 0;
            let percentage = 1 - (Number(req.body.walletDebit) / Number(req.session.totalAmount))
            data = {
                ...data,
                percentage: percentage,
            }
            req.session.orderData = data
            if (req.body.paymentMethod == "Cash On Delivery") {
                let compOrder_id = uniqueid()
                for (const i of user_cart) {
                    let orderId = uniqueid()
                    let product = await productModel.findOne({ _id: i.id })
                    let amount =product.price * i.quantity - discount
                    let payableAmount = (product.price * i.quantity * percentage) - discount
                    await userModel.updateOne({ _id: req.session.userDetails._id }, { $push: { orders: { compoundOrder_id: compOrder_id, order_id: orderId, deliveryAddress: data.deliveryAddress, paymentMethod: 'Cash On Delivery', product_id: product._id, productName: product.product_name, category: product.category, quantity: i.quantity, couponStatus: discount, totalOrderAmount: amount, payableAmount:payableAmount, orderDate: new Date(), orderStatus: 'pending', cancelStatus: false, price: product.price } } })
                }
                await userModel.updateOne({ _id: req.session.userDetails._id }, { $set: { user_cart: [] }})
                if (walletDebit) {
                   await userModel.updateOne({ _id: req.session.userDetails._id }, { $inc: { wallet: -walletDebit }, $push: { walletHistory: { amount: walletDebit, transactionType: 'debit', transactionDate: new Date(), orderId: compOrder_id } } })
                    res.json({ COD: true })
                }
                else{
                    res.json({ COD: true })

                }
            }
            else {
                let orderId = createId()
                userService.generateRazorPay(orderId, data.totalPrice).then((result) => {
                    result.UPI = true
                    res.json({ result })
                })
            }
        })
    },

    verifyOrder: (req, res) => {
        return new Promise(async (resolve, reject) => {
            let data = req.session.orderData
            let walletDebit = parseInt(req.body.walletDebit)
            let details = req.body
            let crypto = require('crypto')
            let hamc = crypto.createHmac('sha256', 'mpif2nSNnpA4zv05FD6rXoIp')
            hamc.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
            hamc = hamc.digest('hex')
            if (hamc == details.payment.razorpay_signature) {
                let { user_cart } = await userModel.findOne({ _id: req.session.userDetails._id }, { user_cart: 1, _id: 0 })
                let compOrder_id = uniqueid()
                let numberOfOrders = user_cart.length
                let discount = data.discount ? data.discount / numberOfOrders : 0;
                let percentage = data.percentage
                for (const i of user_cart) {
                    let orderId = uniqueid()
                    let product = await productModel.findOne({ _id: i.id })
                    let amount =product.price * i.quantity - discount
                    let payableAmount = (product.price * i.quantity * percentage) - discount
                    await userModel.updateOne({ _id: req.session.userDetails._id }, { $push: { orders: { compoundOrder_id: compOrder_id, order_id: orderId, deliveryAddress: data.deliveryAddress, paymentMethod: 'UPI Payment', product_id: product._id, productName: product.product_name, category: product.category, quantity: i.quantity, couponStatus: data.couponStatus, totalOrderAmount: amount,payableAmount:payableAmount,orderDate: new Date(), orderStatus: 'pending', cancelStatus: false, price: product.price } } })
                }
                await userModel.updateOne({ _id: req.session.userDetails._id }, { $set: { user_cart: [] }})
                if (walletDebit) {
                   await userModel.updateOne({ _id: req.session.userDetails._id }, { $inc: { wallet: -walletDebit }, $push: { walletHistory: { amount: walletDebit, transactionType: 'debit', transactionDate: new Date(), orderId: compOrder_id } } })
                    res.json({ UPI: true })
                }
                else{
                    res.json({ UPI: true })

                }
                req.session.orderData = null
            } else {
                reject()
            }
        })
    },

    orderSuccess: (req, res) => {
        res.render('orderConfirmPage')
    },

    adminOrderUpdate: (req, res) => {
        return new Promise((resolve, reject) => {
            if (req.params.update == 'shipped') {
                userModel.updateOne({ _id: req.params.user_id, orders: { $elemMatch: { order_id: req.params.id } } }, { $set: { 'orders.$.orderStatus': 'shipped' } }).then(() => {
                    productModel.updateOne({ _id: req.params.product_id }, { $inc: { stockQuantity: req.params.quantity } }).then((result) => {
                        res.redirect('/admin/order_Details')
                    })
                }).catch(() => {
                    res.render('404')
                })
            }
            else if (req.params.update == 'delivered') {
                userModel.updateOne({ _id: req.params.user_id, orders: { $elemMatch: { order_id: req.params.id } } }, { $set: { 'orders.$.orderStatus': 'delivered' } }).then((result) => {
                    res.redirect('/admin/order_Details')
                }).catch(() => {
                    res.render('404')
                })
            }
            else {
                userModel.updateOne({ _id: req.params.user_id, orders: { $elemMatch: { order_id: req.params.id } } }, { $set: { 'orders.$.cancelStatus': true } }).then((result) => {
                    userModel.updateOne({ _id: req.params.user_id, orders: { $elemMatch: { order_id: req.params.id } } }, { $set: { 'orders.$.orderStatus': 'cancelled' } }).then((result) => {
                        res.redirect('/admin/order_Details')
                    })
                }).catch(() => {
                    res.render('404')
                })

            }
        })
    },

    userOrderUpdate: (req, res) => {
        if (req.query.cond == 'return') {
            userModel.updateOne({ _id: req.session.userDetails._id, orders: { $elemMatch: { order_id: req.query.order_id } } }, { $set: { 'orders.$.orderStatus': 'returned', returnDate: new Date() }, $inc: { wallet: req.query.returnAmount }, $push: { walletHistory: { amount: req.query.returnAmount, transactionType: 'credit', transactionDate: new Date(),  orderId: req.query.order_id } } }).then(() => {
                res.redirect('/orderHistory')
            })
        } else {
            userModel.updateOne({ _id: req.session.userDetails._id, orders: { $elemMatch: { order_id: req.query.order_id } } }, { $set: { 'orders.$.cancelStatus': true, 'orders.$.orderStatus': 'cancelled' } }).then(() => {
                productModel.updateOne({ _id: req.query.product_id }, { $inc: { stockQuantity: req.query.quantity } }).then((result) => {
                    res.redirect('/orderHistory')
                })
            }).catch(() => {
                res.render('404')
            })
        }
    },

    couponApply: (req, res) => {
        couponModel.findOne({ couponCode: req.body.couponCode }).then((result) => {
            if (result) {
                if (result.startDate.getTime() < new Date().getTime() && result.endDate.getTime() > new Date().getTime() && req.body.totalAmount >= result.minPurchaseAmount) {
                    req.session.discountedAmount = req.session.totalAmount - result.discountAmount;
                    res.json({ ...result, totalAmount: req.session.discountedAmount, success: true })
                }
                else {
                    if (req.body.totalAmount < result.minPurchaseAmount) {
                        res.json({ coupon: 'min Amount Reqired' })
                    } else if (result.endDate.getTime() < new Date().getTime()) {
                        res.json({ coupon: 'expired' })
                    }
                    else {
                        res.json({ coupon: 'not found' })
                    }
                }
            } else {
                res.json({ coupon: 'not found' })
            }
        })
    },

    applyWallet: async (req, res) => {
        let wallet = await userModel.findOne({ _id: req.session.userDetails._id }, { wallet: 1, _id: 0 })
        if (req.params.wallet <= wallet) {
            if (req.params.wallet <= req.session.totalAmount) {
                let discountedAmount = Number(req.session.discountedAmount) - Number(req.params.wallet);
                res.json({ success: true, totalAmount: discountedAmount, walletAmount: req.params.wallet })
            } else {
                res.json({ success: false, message: 'Please Enter An Amount Less Than Order Amount' })
            }
        } else {
            res.json({ success: false, message: 'Please Enter A Valid Wallet Amount' })
        }
    }


}