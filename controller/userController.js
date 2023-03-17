const userService = require('../services/userService')
const sentOTP = require('../helpers/otp');
const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const { createId } = require('../middleware/createId');
const { error404 } = require('../middleware/error');
const bcrypt = require('bcrypt');
const uniqueId = require('uniqid');
const bannerModel = require('../models/bannerModel');

let invalidUser;
let nameMsg, emailMsg, passwordMsg, mobnoMsg;
let OTP = Math.floor(Math.random() * 1000000);



module.exports = {

    user_home: async (req, res) => {
        let category = await categoryModel.find().lean()
        let brands
        let quantities = await userModel.findOne({ _id: req.session.userDetails?._id ?? null }, { user_cart: 1, user_whishList: 1, _id: 0 }).lean()
        // if (products) {
        //     brands = category.find(e => e._id == products[0].category)
        // }
        let banners = await bannerModel.find().lean()
        let topBrands = await productModel.find().sort({ price: -1 }).lean().limit(6)
        let topSelling = await productModel.find().sort({ 'productReview.rating': -1 }).lean().limit(6)
        for (const i of topSelling) {
            let array = []
            if (i.productReview?.rating) {
                let limit=Math.floor(i.productReview?.rating??0)
                for (let i = 0; i < limit; i++) {
                    array.push(i)
                }
                i.rating = array
            }
        }

        if (quantities) {
            quantities.user_whishList = quantities.user_whishList?.length ?? null
            quantities.user_cart = quantities.user_cart?.length ?? null
        }
        let userName;
        req.session.userDetails ? userName = req.session.userDetails.name : userName = null
        res.render('user_home', { userName, quantities, banners, topBrands, topSelling })
    },

    home: (req, res) => {
        req.session.productList = null
        res.redirect('/')
    },

    user_login: (req, res) => {
        if (nameMsg || passwordMsg) {
            res.render('user_login', { nameMsg, passwordMsg })
            nameMsg = null
            passwordMsg = null
        }
        else if (invalidUser) {
            res.render('user_login', { invalidUser })
            invalidUser = false;
        }
        else
            res.render('user_login')
    },


    user_signin: (req, res) => {
        const errors = validationResult(req)
        let error1 = errors.errors.find(item => item.param === 'email') || '';
        let error2 = errors.errors.find(item => item.param === 'password') || '';
        if (!errors.isEmpty()) {
            nameMsg = error1.msg, passwordMsg = error2.msg
            res.redirect('/user_login')
        }
        else {
            userService.doLogin(req.body).then((result) => {
                if (result.status) {
                    req.session.user = true;
                    req.session.userDetails = result.userDetails
                    res.redirect('/')
                }
                else {
                    invalidUser = true;
                    res.redirect('/user_login')
                }
            }).catch(() => {
                res.send(error404)
            })
        }
    },

    userLogOut: (req, res) => {
        req.session.destroy();
        res.redirect('/')
    },




    user_signUp: (req, res) => {

        const errors = validationResult(req)
        let error1 = errors.errors.find(item => item.param === 'name') || '';
        let error2 = errors.errors.find(item => item.param === 'email') || '';
        let error3 = errors.errors.find(item => item.param === 'password') || '';
        let error4 = errors.errors.find(item => item.param === 'mob_no') || '';

        if (!errors.isEmpty()) {
            nameMsg = error1.msg, emailMsg = error2.msg, passwordMsg = error3.msg, mobnoMsg = error4.msg
            res.redirect('/user_signup')
        }
        else {
            userService.doValidate(req.body).then((result) => {
                if (result) {
                    res.redirect('/user_signup')
                }
                else {
                    req.session.signUpDetails = req.body
                    req.session.email = req.body.email
                    sentOTP(req.session.email, OTP)
                    req.session.checkOtp = OTP;
                    res.redirect('/signup_otp')
                }
            }).catch(() => {
                res.send(error404)
            })
        }



    },
    user_validateSignUpOTP: (req, res) => {
        if (req.body.otp == req.session.checkOtp) {
            userService.doSignup(req.session.signUpDetails).then(() => {
                res.redirect('/')
                req.session.email = null
                req.session.checkOtp = null;
                req.session.signUpDetails = null;
            }).catch(() => {
                res.send(error404)
            })
        }
        else {
            req.session.invalid_otp = true;
            req.session.checkOtp = null
            res.redirect('/signup_otp')
        }


    },

    user_signUpPage: (req, res) => {

        res.render('user_signup', { nameMsg, emailMsg, passwordMsg, mobnoMsg })
        nameMsg = null, emailMsg = null, passwordMsg = null; mobnoMsg = null
    },

    user_forgotPassword: (req, res) => {

        let display;
        let matchPassword;
        let message;
        req.session.passwordNotMatching ? matchPassword = false : matchPassword = true
        req.session.resetPassword ? message = true : message = false
        req.session.checkOtp ? display = true : display = false
        res.render('forgot_password', { message, display, matchPassword })
        req.session.resetPassword = false


    },

    user_otp: (req, res) => {

        if (req.session.invalid_otp) {
            res.render('signup_OTP', { message: 'Invalid OTP' })
            req.session.invalid_otp = false
        }
        else
            res.render('signup_OTP')



    },

    user_submitForgotPasswordMail: (req, res) => {
        userService.doValidate(req.body).then((result) => {
            if (result) {
                req.session.resetPassword_id = result._id
                sentOTP(req.body.email, OTP)
                req.session.checkOtp = OTP;
                res.redirect('/forgot_password')
            }
            else {

                res.redirect('/forgot_password')
            }
        }).catch(() => {
            res.send(error404)
        })
    },

    user_submitForgotOTP: (req, res) => {
        if (req.body.otp == req.session.checkOtp) {
            req.session.checkOtp = null;
            req.session.resetPassword = true
            res.redirect('/forgot_password')
            req.session.checkOtp = false

        }
        else {
            req.session.checkOtp = null;
            res.redirect('/forgot_password')
        }
    },

    user_resetPassword: async (req, res) => {
        if (req.body.newPassword == req.body.confirmPassword) {
            let newPassword = await bcrypt.hash(req.body.newPassword, 10)
            userModel.updateOne({ _id: req.session.resetPassword_id }, { $set: { password: newPassword } }).then((result) => {
                res.redirect('/user_login')
                req.session.resetPassword_id = null
            }).catch(() => {
                res.send(error404)
            })
        }
        else {
            req.session.passwordNotMatching = true
            res.redirect('/forgot_password')
        }
    },


    resendOTP: (req, res) => {
        sentOTP(req.session.email, OTP)
        req.session.checkOtp = OTP
        res.redirect('/signup_otp')
    },

    user_profilePage: (req, res) => {
        userService.get_userDetails(req.session.userDetails._id).then((data) => {
            for (const i of data.walletHistory) {
                i.refundDate = new Date(i.refundDate).toLocaleDateString()
            }
            data.address.length >= 3 ? maxAddress = true : maxAddress = false
            req.session.editAddress ? edit = req.session.editAddress : edit = null
            req.session.addAddress ? addAddress = true : addAddress = false
            res.render('user_profile', { data, addAddress, maxAddress, edit })
            req.session.addAddress = false
            req.session.editAddress = null
            edit = null
            addAddress = false
        }).catch(() => {
            res.send(error404)
        })

    },

    user_cartPage: (req, res) => {
        try {
            return new Promise(async (resolve, reject) => {
                let cart = await userModel.findOne({ _id: req.session.userDetails._id }, { user_cart: 1 })
                cart.user_cart.length > 0 ? checkOut = true : checkOut = false
                let result = await userModel.findOne({ _id: req.session.userDetails._id })
                let cartQuantities = {}
                const cartID = result.user_cart.map(item => {
                    cartQuantities[item.id] = item.quantity
                    return item.id
                })
                let cartData = await productModel.find({ _id: { $in: cartID } }).lean()
                let cartDatas = cartData.map((item, index) => {
                    return { ...item, quantity: cartQuantities[item._id] }
                })
                let sum = 0;
                cartDatas.forEach(item => {
                    sum = sum + parseInt(item.price) * item.quantity
                })
                cartDatas.totalAmount = sum
                req.session.maxQuantityReached ? message = 'Reached limit,cant add more ' : message = false
                res.render('user_cart', { cartDatas, message, checkOut })
            })

        } catch (error) {
            res.send(error404)
        }
    },

    addAddressPage: (req, res) => {
        req.session.addAddress = true
        res.redirect('/user_profile')
    },

    add_Address: (req, res) => {
        userService.user_addAddress(req.session.userDetails._id, req.body).then(() => {
            res.redirect('/user_profile')
        }).catch(() => {
            res.send(error404)
        })
    },

    deleteAddress: (req, res) => {
        userService.user_delete_address(req.session.userDetails._id, parseInt(req.params.id)).then(() => {
            res.redirect('/user_profile')
        }).catch(() => {
            res.send(error404)
        })
    },

    getUserAddress: (req, res) => {
        userService.getAddress(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
            req.session.editAddress = result;
            res.redirect('/addAddress')
        }).catch(() => {
            res.send(error404)
        })
    },

    address_Update: (req, res) => {
        userService.addressUpdate(parseInt(req.params.id), req.body).then(() => {
            res.redirect('/user_profile')
        }).catch(() => {
            res.send(error404)
        })
    },

    singleProductPage: (req, res) => {
        userService.singleProductDetails(req.params.id).then((result) => {
            res.render('singleProductDetails', { result })
        }).catch(() => {
            res.send(error404)
        })
    },

    orderHistory: (req, res) => {
        return new Promise((resolve, reject) => {
            userModel.findOne({ _id: req.session.userDetails._id }, { orders: 1 }).then(async (result) => {
                let products = [];
                let p = [];
                for (const i of result.orders) {
                    await productModel.findOne({ _id: i.product_id }, { product_name: 1, brandName: 1, price: 1, image: 1 }).lean().then((product) => {
                        console.log(product);
                        product.quantity =i.quantity
                        product.totalAmount = product.price * i.quantity
                        product.order_id = i.order_id
                        product.rating = i.productRating ? i.productRating : null
                        product.orderDate = new Date(i.orderDate).toLocaleDateString()
                        product.orderStatus = i.orderStatus
                        product.cancelStatus = i.cancelStatus
                        if (i.orderStatus == 'delivered') {
                            product.deliveryStatus = true
                        } else if (i.orderStatus == 'returned') {

                            product.returnStatus = true
                        }
                        else {
                            product.deliveryStatus = false
                        }
                        products.push(product)
                    })
                }
                res.render('orderHistory', { products })
            })
            // .catch(() => {
            //     res.send(error404)
            // })
        })
    },

    addToWishList: (req, res) => {
        return new Promise((resolve, reject) => {
            if (req.session.userDetails) {
                userModel.updateOne({ _id: req.session.userDetails._id }, { $addToSet: { user_whishList: { product_id: req.params.id } } }).then((result) => {
                    result.modifiedCount ? success = true : success = false;
                    res.json({ success })
                }).catch(() => {
                    res.send(error404)
                })
            } else {
                res.json({ success: false })
            }
        })
    },

    getWishList: (req, res) => {
        return new Promise((resolve, reject) => {
            userModel.findOne({ _id: req.session.userDetails._id }, { user_whishList: 1 }).then(async (result) => {
                const productId = result.user_whishList.map(item => {
                    return item.product_id
                })
                let productDatas = await productModel.find({ _id: { $in: productId } }).lean()
                for (const i of productDatas) {
                    i.stockQuantity > 0 ? i.stockQuantity = true : i.stockQuantity = false
                }
                res.render('whishList', { productDatas })
            }).catch(() => {
                res.send(error404)
            })
        })
    },

    removeFromWishList: (req, res) => {
        return new Promise((resolve, reject) => {
            userModel.updateOne({ _id: req.session.userDetails._id }, { $pull: { user_whishList: { product_id: req.params.id } } }).then(() => {
                res.json({ success: true })
            }).catch(() => {
                res.send(error404)
            })
        })
    },

    addToCartFromWishList: (req, res) => {
        return new Promise((resolve, reject) => {
            userService.user_add_to_cart(req.session.userDetails._id, req.params.id).then(() => {
                userModel.updateOne({ _id: req.session.userDetails._id }, { $pull: { user_whishList: { product_id: req.params.id } } }).then(() => {
                    res.redirect('/cart')
                })
            }).catch(() => {
                res.send(error404)
            })

        })
    },

    returnProduct: (req, res) => {
        userModel.updateOne({ _id: req.session.userDetails._id }, {})
    }

}

