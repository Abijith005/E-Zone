const userService = require('../services/userService')
const sentOTP = require('../helpers/otp');
let invalidUser;
let signUpDetails;
let OTP = Math.floor(Math.random() * 1000000);
let checkOtp;
let invalid_otp = false;
let resetPassword = false;



module.exports = {

    user_home: (req, res) => {
        let userName;
        req.session.userDetails ? userName = req.session.userDetails.name : userName = null
        res.render('user_home', { userName })
    },


    user_login: (req, res) => {
        if (invalidUser) {
            res.render('user_login', { invalidUser })
            invalidUser = false;
        }
        else
            res.render('user_login')
    },

    user_signin: (req, res) => {
        userService.doLogin(req.body).then((result) => {

            if (result.status) {
                req.session.userDetails = result.userDetails
                res.redirect('/')
            }
            else {
                invalidUser = true;
                res.redirect('/user_login')
            }
        })
    },

    user_signUp: (req, res) => {
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
        res.render('user_signup')
    },

    user_forgotPassword: (req, res) => {
        req.session.resetPassword ? message = true : message = false
        let display
        req.session.checkOtp ? display = true : display = false
        res.render('forgot_password', { message, display })
        req.session.display = false
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
        sentOTP(req.body.email, OTP)
        req.session.checkOtp = OTP;
        res.redirect('/forgot_password')
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

    user_productList: (req, res) => {
        let argument = req.params.id ? req.params.id : req.body.category
        userService.user_searchProduct(argument).then((productData) => {
            res.render('user_productList', { productData })

        })
    },

    resendOTP: (req, res) => {
        sentOTP(req.session.email, OTP)
        req.session.checkOtp = OTP
        res.redirect('/signup_otp')
    },

    user_profilePage: (req, res) => {
        let data = req.session.userDetails
        res.render('user_profile', { data })
    },

    user_profileUpdate: (req, res) => {
        userService.user_profileUpdate(req.body, req.session.userDetails._id)
        res.redirect('/')
    },

    user_cartPage: (req, res) => {
userService.get_userDetails(req.session.userDetails._id).then((result)=>{
let cartData=result;
    res.render('user_cart',{cartData})
})
    },

    product_to_cart: (req, res) => {
        userService.user_add_to_cart(req.session.userDetails._id ,req.params.id)
            res.redirect('/cart')
    }


}