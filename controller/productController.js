const { resolve } = require('promise');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const userService = require('../services/userService')


module.exports = {
    user_productList: (req, res) => {
        let argument = req.params.id ? req.params.id : req.body.searchInput
        // let id=req.session.userDetails?._id??null
        userService.user_searchProduct(argument).then((productData) => {
            req.session.productList = productData
            res.json(productData)
        }).catch(() => {
            res.send('hello')
        })
    },

    getShopPage: async (req, res) => {
        try {
            let category = await categoryModel.find().lean()
            let products = req.session.productList??null
            let brands
            let quantities = await userModel.findOne({ _id: req.session.userDetails?._id ?? null }, { user_cart: 1, user_whishList: 1, _id: 0 }).lean()
            if (products) {
                brands = category.find(e => e._id == products[0].category)
            }
            if (quantities) {
                quantities.user_whishList = quantities.user_whishList?.length ?? null
                quantities.user_cart = quantities.user_cart?.length ?? null
            }
            let userName;
            req.session.userDetails ? userName = req.session.userDetails.name : userName = null
            if(products==null){
               products=await productModel.find().lean()
            }          
            if(req.session.userDetails){
                let whishList= await userModel.findOne({_id:req.session.userDetails._id},{user_whishList:1,_id:0}).lean()
               let productId=whishList.user_whishList.map(item=>{
                return item.product_id
               })
               for (const i of products) {
                   if(productId.includes(i._id.toString())){
                       i.whishList=true
                   }
                }
            }  
            res.render('shopePage', {userName, products, category, brands, quantities })
        } catch (error) {

        }
    },

    search_product_with_category: (req, res) => {
        userService.searchProductWithCategory(req.body.searchInput, req.session.productList[0].category).then((productData) => {
            req.session.productList = productData
            res.redirect('/getShopPage')
        }).catch(() => {
            res.send(error404)
        })
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
        let value = req.params.value
        let category = req.session.productList?.[0]?.category ?? ''
        let products = await productModel.find({ category: category }).sort({ price: value }).lean()
        req.session.productList = products;
        res.redirect('/')
    },

    filterProducts: async (req, res) => {
        let products = await productModel.find({ brandName: req.params.brand }).lean()
        req.session.productList = products
        res.redirect('/')
    }




}




