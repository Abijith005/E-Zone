const userService = require('../services/userService')
const sentOTP = require('../helpers/otp');
const { validationResult } = require('express-validator');
let invalidUser;
let nameMsg,emailMsg,passwordMsg,mobnoMsg;
let OTP = Math.floor(Math.random() * 1000000);



module.exports = {

    user_home: (req, res) => {
        let userName;
        req.session.userDetails ? userName = req.session.userDetails.name : userName = null
        res.render('user_home', { userName })
    },


    user_login: (req, res) => {
        // if (req.session.user) {
        //     res.redirect('/')
        // }
        // else {
            if (invalidUser) {
                res.render('user_login', { invalidUser })
                invalidUser = false;
            }
            else
                res.render('user_login')
        // }
    },


    user_signin: (req, res) => {
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
            nameMsg=error1.msg, emailMsg=error2.msg, passwordMsg=error3.msg,mobnoMsg=error4.msg 
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
        // if (req.session.user) {
        //     res.redirect('/')
        // } 
        // else {
            res.render('user_signup',{nameMsg,emailMsg,passwordMsg,mobnoMsg})
            nameMsg=null,emailMsg=null,passwordMsg=null;mobnoMsg=null
        // }
    },

    user_forgotPassword: (req, res) => {
        // if (req.session.user) {
        //     res.redirect('/')
        // } else {

            let display;
            let matchPassword;
            let message;
            req.session.passwordNotMatching ? matchPassword = false : matchPassword = true
            req.session.resetPassword ? message = true : message = false
            req.session.checkOtp ? display = true : display = false
            res.render('forgot_password', { message, display, matchPassword })
            req.session.checkOtp = false
            req.session.resetPassword = false

        // }

    },

    user_otp: (req, res) => {
        // if (req.session.user) {
        //     res.redirect('/')
        // } else {

            if (req.session.invalid_otp) {
                res.render('signup_OTP', { message: 'Invalid OTP' })
                req.session.invalid_otp = false
            }
            else
                res.render('signup_OTP')
        // }



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

        userService.get_userDetails(req.session.userDetails._id).then((data)=>{
            data.address.length>=3?maxAddress=true:maxAddress=false
            req.session.addAddress? addAddress=true:addAddress=false
            res.render('user_profile', { data,addAddress,maxAddress })
            req.session.addAddress=false
            addAddress=false
        })

        
    },

    user_cartPage: (req, res) => {
        // if (req.session.user) {

            userService.get_userDetails(req.session.userDetails._id).then((result) => {
                let cartData = result;
                res.render('user_cart', { cartData })
            })
        // } 
        // else {
        //     res.redirect('/')
        // }
    },

addAddressPage:(req,res)=>{
    req.session.addAddress=true
res.redirect('/user_profile')
},

    add_Address:(req,res)=>{
        console.log('**********************');
        userService.user_addAddress(req.session.userDetails._id,req.body).then(()=>{
            res.redirect('/user_profile')
        })
    },

    deleteAddress:(req,res)=>{
        console.log(req.params.id+'**********'+req.session.userDetails._id);
        userService.user_delete_address(req.session.userDetails._id, req.params.id).then(()=>{
            res.redirect('/user_profile')
        })
    }


}

