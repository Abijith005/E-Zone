const { resolve } = require('promise');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const userService = require('../services/userService')


module.exports = {
    user_productList: async (req, res) => {
        let argument
        let brands
        req.session.sortValue=null
        req.session.allproducts = false
        if (req.params.id) {
            argument = req.params.id
            req.session.category = argument
            console.log(argument);
            let { brandName } = await categoryModel.findOne({ _id: argument }, { _id: 0, brandName: 1 })
            brands = brandName
        } else {
            argument = req.body.searchInput
        }
        req.session.searchInput = req.body.searchInput
        userService.user_searchProduct(argument).then(async (productData) => {
            req.session.productList = productData
            if (req.session.userDetails) {
                let whishList = await userModel.findOne({ _id: req.session.userDetails._id }, { user_whishList: 1, _id: 0 }).lean()
                let productId = whishList.user_whishList.map(item => {
                    return item.product_id
                })
                for (const i of productData) {
                    if (productId.includes(i._id.toString())) {
                        i.whishList = true
                    }
                }
            }
            if (brands) {
                res.json({ productData, brands })
            }
            else {
                res.json(productData)
            }
        }).catch(() => {
            res.send('hello')
        })
    },

    getShopPage: async (req, res) => {
        console.log('getShopPage');
        try {
            req.session.sortValue=null
            req.session.category = null
            req.session.allproducts = true
            let category = await categoryModel.find().lean()
            let brands
            let quantities = await userModel.findOne({ _id: req.session.userDetails?._id ?? null }, { user_cart: 1, user_whishList: 1, _id: 0 }).lean()
            if (quantities) {
                quantities.user_whishList = quantities.user_whishList?.length ?? null
                quantities.user_cart = quantities.user_cart?.length ?? null
            }
            let userName;
            req.session.userDetails ? userName = req.session.userDetails.name : userName = null
            let products = await productModel.find().lean()
            if (req.session.userDetails) {
                let whishList = await userModel.findOne({ _id: req.session.userDetails._id }, { user_whishList: 1, _id: 0 }).lean()
                let productId = whishList.user_whishList.map(item => {
                    return item.product_id
                })
                for (const i of products) {
                    if (productId.includes(i._id.toString())) {
                        i.whishList = true
                    }
                }
            }
            brands = products.map(item => {
                return item.brandName
            })
            for (const i of products) {
                let data = category.find(e => i.category == e._id)
                i.category = data.category
            }
            res.render('shopePage', { userName, products, category, brands, quantities })
        } catch (error) {
        }
    },

    getAllProducts: async (req, res) => {
        console.log('getAllProducts');
        try {
            req.session.sortValue=null
            req.session.category = null
            req.session.allproducts = true
            let products = await productModel.find().lean()
            if (req.session.userDetails) {
                let whishList = await userModel.findOne({ _id: req.session.userDetails._id }, { user_whishList: 1, _id: 0 }).lean()
                let productId = whishList.user_whishList.map(item => {
                    return item.product_id
                })
                for (const i of products) {
                    if (productId.includes(i._id.toString())) {
                        i.whishList = true
                    }
                }
            }
            res.json(products)
        } catch (error) {

        }
    },

    search_product_with_category: (req, res) => {
        console.log('search_product_with_category');
        if (req.session.allproducts) {
            let input = req.body.searchInput
            productModel.find({ $and: [{ flag: false }, { $or: [{ product_name: new RegExp(input, 'i') }, { brandName: new RegExp(input, 'i') }] }] }).then(async (productData) => {
                req.session.productList = productData

                if (req.session.userDetails) {
                    let whishList = await userModel.findOne({ _id: req.session.userDetails._id }, { user_whishList: 1, _id: 0 }).lean()
                    let productId = whishList.user_whishList.map(item => {
                        return item.product_id
                    })
                    for (const i of productData) {
                        if (productId.includes(i._id.toString())) {
                            i.whishList = true
                        }
                    }
                }
                res.json(productData)
            }).catch(() => {
                res.send(error404)
            })
        } else {
            userService.searchProductWithCategory(req.body.searchInput, req.session.category).then(async (productData) => {
                if (req.session.userDetails) {
                    let whishList = await userModel.findOne({ _id: req.session.userDetails._id }, { user_whishList: 1, _id: 0 }).lean()
                    let productId = whishList.user_whishList.map(item => {
                        return item.product_id
                    })
                    for (const i of productData) {
                        if (productId.includes(i._id.toString())) {
                            i.whishList = true
                        }
                    }
                }
                req.session.productList = productData
                res.json(productData)
            }).catch(() => {
                res.send(error404)
            })
        }
    },

    product_to_cart: (req, res) => {
        userService.user_add_to_cart(req.session.userDetails._id, req.params.id).then((result) => {
            res.json(result)
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
                        if (value == 1) {
                            res.json({ message: 'Reached limit,cant add more' })
                        } else {
                            res.json({ message: 'Reached limit,cant remove more' })
                        }
                    }
                }
                else {
                    res.json({ message: 'cant add more Stock Out' })
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
    },

    sortProducts: async (req, res) => {
        req.session.sortValue = req.params.value
        let value = req.params.value
        let category = req.session.category ?? ''
        let products
        if (category) {
            products = await productModel.find({ category: category }).sort({ price: value }).lean()
        } else {
            products = await productModel.find().sort({ price: value }).lean()
        }
        res.redirect('/')
    },

    filterProducts: async (req, res) => {
        let value=req.session.sortValue ?value=req.session.sortValue :value=0
        let category = req.session.category
        console.log(category, 'filterrrrrrrrrrrrrrr');
        let products = await productModel.find({ $and: [{ category: category }, { brandName: req.params.brand }] }).sort({price:value}).lean()
        console.log(products);
        req.session.productList = products
        res.redirect('/')
    }




}




