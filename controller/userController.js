const userService = require('../services/userService')
const sentOTP = require('../helpers/otp');
let invalidUser;
let signUpDetails;
let OTP = Math.floor(Math.random()*1000000);
let checkOtp;
let invalid_otp = false;
let resetPassword = false;



module.exports = {

    user_home: (req, res) => {
        res.render('user_home')
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
                signUpDetails = req.body
                sentOTP(req.body.email, OTP)
                checkOtp = OTP;

                res.redirect('/signup_otp')

            }
        })

    },
    user_validateSignUpOTP: (req, res) => {
        if (req.body.otp == checkOtp) {
            userService.doSignup(signUpDetails).then((data) => {
                res.redirect('/')
                checkOtp = null;
                signUpDetails = null;
            })
        }
        else {
            invalid_otp = true;
            checkOtp = null
            res.redirect('/signup_otp')
        }


    },

    user_signUpPage: (req, res) => {
        res.render('user_signup')
    },

    user_forgotPassword: (req, res) => {
        resetPassword ? message = true : message = false
        let display
        checkOtp ? display = true : display = false
        res.render('forgot_password', { message, display })
       display = false
        resetPassword = false
    },

    user_otp: (req, res) => {
        if (invalid_otp) {
            res.render('signup_OTP', { message: 'Invalid OTP :' })
            invalid_otp = false
        }
        else
            res.render('signup_OTP')

    },
    user_submitForgotPasswordMail: (req, res) => {
        sentOTP(req.body.email, OTP)
        checkOtp = OTP;
        res.redirect('/forgot_password')
    },

    user_submitForgotOTP: (req, res) => {
        if (req.body.otp == checkOtp) {
            checkOtp = null;
            resetPassword = true
            res.redirect('/forgot_password')

        }
        else {
            checkOtp = null;
            res.redirect('/forgot_password')
        }
    },

    user_productList:(req,res)=>{
       let argument=req.params.id?req.params.id:req.body.category
        userService.user_searchProduct(argument).then((productData)=>{
            res.render('user_productList',{productData})

        })
    }

}
