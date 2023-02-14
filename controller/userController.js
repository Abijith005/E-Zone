const userService = require('../services/userService')
const sentOTP = require('../helpers/otp');
const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
let invalidUser;
let nameMsg, emailMsg, passwordMsg, mobnoMsg;
let OTP = Math.floor(Math.random() * 1000000);



module.exports = {

    user_home: async (req, res) => {
        let data = await categoryModel.find().lean()
        let userName;
        req.session.userDetails ? userName = req.session.userDetails.name : userName = null
        res.render('user_home', { userName, data })
    },


    user_login: (req, res) => {
        if (nameMsg || passwordMsg) {
            res.render('user_login', {nameMsg,passwordMsg})
            nameMsg=null
            passwordMsg=null
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
            })
        }



    },
    user_validateSignUpOTP: (req, res) => {
        if (req.body.otp == req.session.checkOtp) {
            userService.doSignup(req.session.signUpDetails).then((data) => {
                res.redirect('/')
                req.session.email = null
                req.session.checkOtp = null;
                req.session.signUpDetails = null;
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
        req.session.checkOtp = false
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
                sentOTP(req.body.email, OTP)
                req.session.checkOtp = OTP;
                res.redirect('/forgot_password')
            }
            else {

                res.redirect('/forgot_password')
            }
        })
    },

    user_submitForgotOTP: (req, res) => {
        if (req.body.otp == req.session.checkOtp) {
            req.session.checkOtp = null;
            req.session.resetPassword = true
            res.redirect('/forgot_password')

        }
        else {
            req.session.checkOtp = null;
            res.redirect('/forgot_password')
        }
    },

    user_resetPassword: (req, res) => {
        if (req.body.newPassword == req.body.confirmPassword) {
            userService.user_changePassword(req.body.newPassword).then(() => {
                res.redirect('/user_login')
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
            data.address.length >= 3 ? maxAddress = true : maxAddress = false
            req.session.editAddress ? edit = req.session.editAddress : edit = null
            req.session.addAddress ? addAddress = true : addAddress = false
            res.render('user_profile', { data, addAddress, maxAddress, edit })
            req.session.addAddress = false
            req.session.editAddress = null
            edit = null
            addAddress = false
        })


    },

    user_cartPage: (req, res) => {
        return new Promise(async (resolve, reject) => {
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
            req.session.maxQuantityReached?message='Reached limit,cant add more ':message=false
            res.render('user_cart', { cartDatas,message })
            req.session.maxQuantityReached=false
        })
    },

    addAddressPage: (req, res) => {
        req.session.addAddress = true
        res.redirect('/user_profile')
    },

    add_Address: (req, res) => {
        userService.user_addAddress(req.session.userDetails._id, req.body).then(() => {
            res.redirect('/user_profile')
        })
    },

    deleteAddress: (req, res) => {
        userService.user_delete_address(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
            res.redirect('/user_profile')
        })
    },

    getUserAddress: (req, res) => {
        userService.getAddress(req.session.userDetails._id, parseInt(req.params.id)).then((result) => {
            req.session.editAddress = result;
            res.redirect('/addAddress')
        })
    },

    address_Update: (req, res) => {
        userService.addressUpdate(parseInt(req.params.id), req.body).then(() => {
            res.redirect('/user_profile')
        })
    },

    singleProductPage: (req, res) => {
        userService.singleProductDetails(req.params.id).then((result) => {
            res.render('singleProductDetails', { result })

        })
    }


}

