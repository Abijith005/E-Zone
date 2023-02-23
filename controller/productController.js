const { resolve } = require('promise');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const userService = require('../services/userService')



module.exports = {
    user_productList: (req, res) => {
        let argument = req.params.id ? req.params.id : req.body.searchInput
        userService.user_searchProduct(argument).then((productData) => {
            req.session.productList = productData
            res.redirect('/showProductList')
        }).catch(() => {
            res.send('hello')
        })
    },

    show_productList: (req, res) => {
        return new Promise(async (resolve, reject) => {
            let category = await categoryModel.find().lean()
            let products = req.session.productList
            res.render('user_productList', { products, category })
            // req.session.productList = null;
        }).catch(() => {
            res.send(error404)
        })
    },

    search_product_with_category: (req, res) => {
        userService.searchProductWithCategory(req.body.searchInput, req.session.productList[0].category).then((productData) => {
            req.session.productList = productData
            res.redirect('/showProductList')
        }).catch(() => {
            res.send(error404)
        })
    },

    product_to_cart: (req, res) => {
        userService.user_add_to_cart(req.session.userDetails._id, req.params.id).then(() => {
            res.json({ success: true })
        }).catch(() => {
            res.send(error404)
        })
    },

    productQuantityIncreaseOrDecrease: (req, res) => {
        return new Promise(async (resolve, reject) => {
            productModel.findOne({ _id: req.body.id }, { stockQuantity: 1 }).then((result) => {
                let value;
                req.body.cond == 1 ? value = 1 : value = -1
                if (result.stockQuantity > 0 || value == -1) {
                    if (value == -1 && req.body.quantity > 1) {
                        userModel.updateOne({ _id: req.session.userDetails._id, user_cart: { $elemMatch: { id: req.body.id } } }, { $inc: { 'user_cart.$.quantity': value } }).then(() => {
                            productModel.updateOne({ _id: req.body.id }, { $inc: { stockQuantity: 1 } }).then(() => {
                                userService.cartProductDatas(req.session.userDetails._id).then((result) => {
                                    res.json({ totalAmount: result.totalAmount, success: true })
                                })
                            })
                        })
                    }
                    else if (value == 1 && req.body.quantity < 10) {
                        userModel.updateOne({ _id: req.session.userDetails._id, user_cart: { $elemMatch: { id: req.body.id } } }, { $inc: { 'user_cart.$.quantity': value } }).then(() => {
                            productModel.updateOne({ _id: req.body.id }, { $inc: { stockQuantity: -1 } }).then((result) => {
                                userService.cartProductDatas(req.session.userDetails._id).then((result) => {
                                    res.json({ totalAmount: result.totalAmount, success: true })
                                })
                            })
                        })
                    }
                    else { 

                        res.redirect('/cart')
                    }
                }
                else {
                    res.redirect('/cart')
                }
            }).catch(() => {
                res.send(error404)
            })
        })
    },

    deleteFromCart: (req, res) => {
        return new Promise((resolve, reject) => {
            userModel.updateOne({ _id: req.session.userDetails._id }, { $pull: { user_cart: { id: req.params.id } } }, { multi: true }).then(() => {
                productModel.updateOne({ _id: req.params.id }, { $inc: { stockQuantity: req.params.quantity } }).then((result) => {
                    res.redirect('/cart')
                })
            })
        }).catch(() => {
            res.send(error404)
        })
    }


}




