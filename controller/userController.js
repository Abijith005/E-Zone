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
        let banners = await bannerModel.find().lean()
        let topBrands = await productModel.find().sort({ price: -1 }).lean().limit(6)
        let topRated= await productModel.find().sort({ 'productReview.rating': -1 }).lean().limit(6)
        for (const i of topRated) {
            let array = []
                let limit=Math.floor(i.productReview?.rating??0)
                for (let i = 0; i < 5; i++) {
                    if (i<limit) {
                        array.push('1')
                    } else {
                        array.push('0')
                    }
                }
                i.rating = array
        }
        if (quantities) {
            quantities.user_whishList = quantities.user_whishList?.length ?? null
            quantities.user_cart = quantities.user_cart?.length ?? null
        }
        let userName;
        req.session.userDetails ? userName = req.session.userDetails.name : userName = null
        res.render('user_home', { userName, quantities, banners, topBrands, topRated })
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
                res.render('404')
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
                res.render('404')
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
                res.render('404')
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
            res.render('signup_otp', { message: 'Invalid OTP' })
            req.session.invalid_otp = false
        }
        else
            res.render('signup_otp')



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
            res.render('404')
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
                res.render('404')
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
                i.transactionDate = new Date(i.transactionDate).toLocaleDateString()
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
            res.render('404')
        })

    },

    user_cartPage: (req, res) => {
        try {
            return new Promise(async (resolve, reject) => {
                 let cart = await userModel.findOne({ _id: req.session.userDetails._id })
                let cartQuantities = {}
                const cartID = cart.user_cart.map(item => {
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
                cartDatas.userName=cart.name
                req.session.maxQuantityReached ? message = 'Reached limit,cant add more ' : message = false
                res.render('user_cart', { cartDatas, message })
            })

        } catch (error) {
            res.render('404')
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
            res.render('404')
        })
    },

    deleteAddress: (req, res) => {
        userService.user_delete_address(req.session.userDetails._id, parseInt(req.params.id)).then(() => {
            res.redirect('/user_profile')
        }).catch(() => {
            res.render('404')
        })
    },

    getUserAddress: (req, res) => {
        userService.getAddress(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
            req.session.editAddress = result;
            res.redirect('/addAddress')
        }).catch(() => {
            res.render('404')
        })
    },

    address_Update: (req, res) => {
        userService.addressUpdate(parseInt(req.params.id), req.body).then(() => {
            res.redirect('/user_profile')
        }).catch(() => {
            res.render('404')
        })
    },

    singleProductPage: (req, res) => {
        userService.singleProductDetails(req.params.id).then((result) => {
            let limit=result.productReview?.rating??0
            let rating=[]
            for(let i=0;i<5;i++){
                if (i<limit) {
                    rating.push('1')
                }
                else{
                    rating.push('0')
                }
            }
            result.rating=rating
            console.log(result,'sdfghnm');
            res.render('singleProductDetails', { result })
        }).catch(() => {
            res.render('404')
        })
    },

    orderHistory: (req, res) => {
        return new Promise((resolve, reject) => {
            userModel.findOne({ _id: req.session.userDetails._id }, { orders: 1 }).then(async (result) => {
                let products = [];
                let p = [];
                for (const i of result.orders) {
                    await productModel.findOne({ _id: i.product_id }, { product_name: 1, brandName: 1, price: 1, image: 1 }).lean().then((product) => {
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
            .catch(() => {
                res.render('404')
            })
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
                productDatas.userName=req.session.userDetails.name
                res.render('whishList', { productDatas })
            }).catch(() => {
                res.render('404')
            })
        })
    },

    removeFromWishList: (req, res) => {
        return new Promise((resolve, reject) => {
            userModel.findByIdAndUpdate({ _id: req.session.userDetails._id }, { $pull: { user_whishList: { product_id: req.params.id } } }).then((result) => {
                if (result.user_whishList.length<=1) {
                    res.json({ success:true,remove:false})
                } else {
                    res.json({success:true,remove:true})
                }
            }).catch(() => {
                res.render('404')
            })
        })
    },

    addToCartFromWishList: (req, res) => {
        return new Promise((resolve, reject) => {
            userService.user_add_to_cart(req.session.userDetails._id, req.params.id).then(() => {
                userModel.findByIdAndUpdate({ _id: req.session.userDetails._id }, { $pull: { user_whishList: { product_id: req.params.id } } }).then((result) => {
                    if (result.user_whishList.length<=1) {
                        res.json({success:false})
                    }
                    else{
                        res.json({success:true})
                    }
                })
            }).catch(() => {
                res.render('404')
            })

        })
    },
 

}

