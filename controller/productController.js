const { resolve } = require('promise');
const categoryModel = require('../models/categoryModel');
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
    }


}

