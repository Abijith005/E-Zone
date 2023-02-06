const userService = require('../services/userService')
const sentOTP = require('../helpers/otp');
let invalidUser;
let OTP = Math.floor(Math.random() * 1000000);



module.exports = {

    user_home: (req, res) => {
        let userName;
        req.session.userDetails ? userName = req.session.userDetails.name : userName = null
        res.render('user_home', { userName })
    },


    user_login: (req, res) => {
        if (req.session.user) {
            res.redirect('/')
        }
        else {
            if (invalidUser) {
                res.render('user_login', { invalidUser })
                invalidUser = false;
            }
            else
                res.render('user_login')
        }
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

    // router.post('/signup',check('Name').notEmpty().withMessage("please Enter a Name"),check('Email')
    // .matches(/^\w+([\._]?\w+)?@\w+(\.\w{2,3})(\.\w{2})?$/)
    //     .withMessage("Must be a valid Email id"),check('Password').matches(/[\w\d!@#$%^&*?]{6,}/)
    //     .withMessage("Password must contain atleast 6 characters"),
    //   (req, res) => {
    //     const errors = validationResult(req)
    //     let error1 = errors.errors.find(item => item.param === 'Name') || '';
    //     let error2 = errors.errors.find(item => item.param === 'Email') || '';
    //     let error3 = errors.errors.find(item => item.param === 'Password') || '';
    
    //     if (!errors.isEmpty()) {
    //       res.render('signup', {nameMsg: error1.msg, emailMsg: error2.msg, passwordMsg: error3.msg })




    user_signUp: (req, res) => {

        const errors = validationResult(req)
        //     let error1 = errors.errors.find(item => item.param === 'Name') || '';
        //     let error2 = errors.errors.find(item => item.param === 'Email') || '';
        //     let error3 = errors.errors.find(item => item.param === 'Password') || '';
        
        //     if (!errors.isEmpty()) {
        //       res.render('signup', {nameMsg: error1.msg, emailMsg: error2.msg, passwordMsg: error3.msg })



        // ************************************************************
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
        if (req.session.user) {
            res.redirect('/')
        } else {
        //    res.render('signup', {nameMsg: error1.msg, emailMsg: error2.msg, passwordMsg: error3.msg })
            
            res.render('user_signup')
        }
    },

    user_forgotPassword: (req, res) => {
if (req.session.user) {
    res.redirect('/')
} else {
    
            let display;
            let matchPassword;
            let message;
            req.session.passwordNotMatching ? matchPassword = false : matchPassword = true
            req.session.resetPassword ? message = true : message = false
            req.session.checkOtp ? display = true : display = false
            res.render('forgot_password', { message, display, matchPassword })
            req.session.checkOtp = false
            req.session.resetPassword = false
    
}

    },

    user_otp: (req, res) => {
if (req.session.user) {
    res.redirect('/')
} else {
    
    if (req.session.invalid_otp) {
        res.render('signup_OTP', { message: 'Invalid OTP' })
        req.session.invalid_otp = false
    }
    else
        res.render('signup_OTP')
}



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

    resendOTP: (req, res) => {
        sentOTP(req.session.email, OTP)
        req.session.checkOtp = OTP
        res.redirect('/signup_otp')
    },

    user_profilePage: (req, res) => {
        if (req.session.user) {
            let data = req.session.userDetails
            res.render('user_profile', { data })
            
        } else {
            res.redirect('/')
        }
    },

    user_profileUpdate: (req, res) => {
        userService.user_profileUpdate(req.body, req.session.userDetails._id)
        res.redirect('/')
    },

    user_cartPage: (req, res) => {
        if (req.session.user) {
            
            userService.get_userDetails(req.session.userDetails._id).then((result) => {
                let cartData = result;
                res.render('user_cart', { cartData })
            })
        } else {
            res.redirect('/')
        }
    },

    product_to_cart: (req, res) => {
        if (req.session.user) {
            
            userService.user_add_to_cart(req.session.userDetails._id, req.params.id)
            res.redirect('/cart')
        } else {
            res.redirect('/')
        }
    }

}

