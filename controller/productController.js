const { resolve } = require('promise');
const categoryModel = require('../models/categoryModel');
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
        let products = req.session.productList
        res.render('user_productList', { products })
        req.session.productList = null;
    },

    search_product_with_category: (req, res) => {
        userService.searchProductWithCategory(req.body.searchInput, req.session.productList[0].category).then((productData) => {
            req.session.productList = productData
            res.redirect('/showProductList')
        })
    },

    product_to_cart: (req, res) => {
        userService.user_add_to_cart(req.session.userDetails._id, req.params.id)
        res.redirect('/cart')
    },

    productQuantityIncreaseOrDecrease: (req, res) => {
        return new Promise((resolve, reject) => {
            let value;
            req.params.cond==1?value=1:value=-1
        if(value==-1&&req.params.quantity>1){
            userModel.updateOne({ _id: req.session.userDetails._id, user_cart: { $elemMatch: { id: req.params.id } } }, { $inc: { 'user_cart.$.quantity': value } }).then((result) => {
                res.redirect('/cart')
            })
        }
       else if(value==1&&req.params.quantity<10){
            userModel.updateOne({ _id: req.session.userDetails._id, user_cart: { $elemMatch: { id: req.params.id } } }, { $inc: { 'user_cart.$.quantity': value } }).then((result) => {
                res.redirect('/cart')
            })
        }
        else{

            res.redirect('/cart')
        }


        })
    }


}

