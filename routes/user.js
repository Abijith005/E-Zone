const express=require('express')
const router=express.Router()
const userController=require('../controller/userController')

router.get('/',userController.user_home)

router.get('/user_login',userController.user_login)

router.post('/user_signIn',userController.user_signin)

router.get('/user_signUp',userController.user_signUpPage)

router.post('/user_signUP',userController.user_signUp)

// ,check('name').notEmpty().withMessage("please Enter a Name"),check('email')
// .matches(/^\w+([\._]?\w+)?@\w+(\.\w{2,3})(\.\w{2})?$/)
//     .withMessage("Must be a valid Email id"),check('Password').matches(/[\w\d!@#$%^&*?]{6,}/)
//     .withMessage("Password must contain atleast 6 characters") 

router.get('/user_logOut',userController.userLogOut)

router.get('/forgot_password',userController.user_forgotPassword)

router.post('/resetPassword',userController.user_resetPassword)

router.get('/signup_otp',userController.user_otp)

router.post('/signup_otp',userController.user_validateSignUpOTP)

router.post('/submit_forgotOTP',userController.user_submitForgotOTP)

router.post('/submit_mailForgotPassword',userController.user_submitForgotPasswordMail)

router.get('/productList/:id',userController.user_productList)

router.post('/productList',userController.user_productList)

router.post('/search_product_with_category',userController.search_product_with_category)

router.get('/showProductList',userController.show_productList)

router.get('/resendOTP',userController.resendOTP)

router.get('/user_profile',userController.user_profilePage)

router.post('/update_profile',userController.user_profileUpdate)

router.get('/cart',userController.user_cartPage)

router.get('/add_to_cart/:id',userController.product_to_cart)




module.exports=router;

