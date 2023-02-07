const express = require('express')
const { check } = require('express-validator')
const router = express.Router()
const userController = require('../controller/userController')

router.get('/', userController.user_home)

router.get('/user_login', userController.user_login)

router.post('/user_signIn', userController.user_signin)

router.get('/user_signUp', userController.user_signUpPage)


// .matches(/^\w+([\._]?\w+)?@\w+(\.\w{2,3})(\.\w{2})?$/)

router.post('/user_signUP'
    , check('name').matches(/[a-zA-Z0-9]+/).withMessage("Enter a Valid Name"), check('email')
        .matches(/[a-zA-Z0-9_\-\.]+[@][a-z]+[\.][a-z]{2,3}/).withMessage("Enter a Valid Email id"), check('password').matches(/[\w\d!@#$%^&*?]{6,}/)
            .withMessage("Password Must Contain Atleast 6 Characters"),check('mob_no').matches(/[0-9]{10}/).withMessage('Enter a Valid Mobile Number')
    , userController.user_signUp)

router.get('/user_logOut', userController.userLogOut)

router.get('/forgot_password', userController.user_forgotPassword)

router.post('/resetPassword', userController.user_resetPassword)

router.get('/signup_otp', userController.user_otp)

router.post('/signup_otp', userController.user_validateSignUpOTP)

router.post('/submit_forgotOTP', userController.user_submitForgotOTP)

router.post('/submit_mailForgotPassword', userController.user_submitForgotPasswordMail)

router.get('/productList/:id', userController.user_productList)

router.post('/productList', userController.user_productList)

router.post('/search_product_with_category', userController.search_product_with_category)

router.get('/showProductList', userController.show_productList)

router.get('/resendOTP', userController.resendOTP)

router.get('/user_profile', userController.user_profilePage)

router.post('/update_profile', userController.user_profileUpdate)

router.get('/cart', userController.user_cartPage)

router.get('/add_to_cart/:id', userController.product_to_cart)




module.exports = router;

