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
        })
    },

    show_productList: (req, res) => {
        return new Promise(async (resolve, reject) => {
            let category = await categoryModel.find().lean()

            let products = req.session.productList
            res.render('user_productList', { products, category })
            // req.session.productList = null;
        })
    },

    search_product_with_category: (req, res) => {
        userService.searchProductWithCategory(req.body.searchInput, req.session.productList[0].category).then((productData) => {
            req.session.productList = productData
            res.redirect('/showProductList')
        }).catch((err) => {
            res.redirect('/')
        })
    },

    product_to_cart: (req, res) => {
        userService.user_add_to_cart(req.session.userDetails._id, req.params.id).then(()=>{

            res.redirect('/cart')
        })
    },

    productQuantityIncreaseOrDecrease: (req, res) => {
        return new Promise((resolve, reject) => {
            productModel.findOne({_id:req.params.id},{stockQuantity:1}).then((result)=>{
                let value;
                req.params.cond == 1 ? value = 1 : value = -1
                if(result.stockQuantity>0||value == -1){
                    if (value == -1 && req.params.quantity > 1) {
                        userModel.updateOne({ _id: req.session.userDetails._id, user_cart: { $elemMatch: { id: req.params.id } } }, { $inc: { 'user_cart.$.quantity': value } }).then(() => {
                            productModel.updateOne({ _id: req.params.id }, { $inc: { stockQuantity: 1 } }).then((result)=>{
                                res.redirect('/cart')
        
                            })
                        })
                    }
                    else if (value == 1 && req.params.quantity < 10) {
                        userModel.updateOne({ _id: req.session.userDetails._id, user_cart: { $elemMatch: { id: req.params.id } } }, { $inc: { 'user_cart.$.quantity': value } }).then(() => {
                            productModel.updateOne({ _id: req.params.id }, { $inc: { stockQuantity: -1 } }).then((result)=>{
                                res.redirect('/cart')
                            })
                        })
                    }
                    else {
        
                        res.redirect('/cart')
                    }
                }
                else{
                    res.redirect('/cart')
                }
            })
        })
    },

    deleteFromCart: (req, res) => {
        return new Promise((resolve, reject) => {
            console.log(req.params.quantity);
            userModel.updateOne({ _id: req.session.userDetails._id }, { $pull: { user_cart: { id: req.params.id } } }, { multi: true }).then(() => {
                productModel.updateOne({ _id: req.params.id }, { $inc: { stockQuantity: -1 } }).then((result)=>{
                    res.redirect('/cart')
                })
            })
        })
    }


}




