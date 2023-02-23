const express = require('express')
const { check } = require('express-validator')
const router = express.Router()
const userController = require('../controller/userController')
const productController=require('../controller/productController')
const userSession=require('../middleware/userSession')
const orderController = require('../controller/orderController')
const { ifUser } = require('../middleware/userSession')


router.get('/', userController.user_home)

router.get('/user_login',userSession.ifNoUser, userController.user_login)

router.post('/user_signIn', check('email')
.matches(/[a-zA-Z0-9_\-\.]+[@][a-z]+[\.][a-z]{2,3}/).withMessage("Enter a Valid Email id"),check('password').notEmpty().withMessage('Enter your password'),userSession.ifNoUser, userController.user_signin)

router.get('/user_signUp',userSession.ifNoUser, userController.user_signUpPage)

router.post('/user_signUP'
    , check('name').matches(/[a-zA-Z0-9]+/).withMessage("Enter a Valid Name"), check('email')
        .matches(/[a-zA-Z0-9_\-\.]+[@][a-z]+[\.][a-z]{2,3}/).withMessage("Enter a Valid Email id"), check('password').matches(/[\w\d!@#$%^&*?]{6,}/)
            .withMessage("Password Must Contain Atleast 6 Characters"),check('mob_no').matches(/[0-9]{10}/).withMessage('Enter a Valid Mobile Number')
    , userController.user_signUp)
 
router.get('/user_logOut', userController.userLogOut)

router.get('/forgot_password',userSession.ifNoUser, userController.user_forgotPassword)

router.post('/resetPassword',userSession.ifNoUser ,userController.user_resetPassword)

router.get('/signup_otp',userSession.ifNoUser, userController.user_otp)

router.post('/signup_otp',userSession.ifNoUser, userController.user_validateSignUpOTP)

router.post('/submit_forgotOTP',userSession.ifNoUser, userController.user_submitForgotOTP)

router.post('/submit_mailForgotPassword',userSession.ifNoUser, userController.user_submitForgotPasswordMail)

router.get('/productList/:id',productController.user_productList)

router.post('/productList',productController.user_productList)

router.post('/search_product_with_category',productController.search_product_with_category)

router.get('/showProductList',productController.show_productList)

router.get('/resendOTP',userSession.ifNoUser,userController.resendOTP)

router.get('/user_profile',userSession.ifUser, userController.user_profilePage)

router.get('/cart',userSession.ifUser,userController.user_cartPage)

router.get('/add_to_cart/:id',userSession.ifUser,productController.product_to_cart)

router.get('/addAddress',userSession.ifUser,userController.addAddressPage)

router.post('/addAddress',userSession.ifUser,userController.add_Address)

router.get('/delete_user_address/:id',userSession.ifUser,userController.deleteAddress)

router.get('/edit_Address/:id',userSession.ifUser,userController.getUserAddress)

router.post('/update_address/:id',userSession.ifUser,userController.address_Update)

router.get('/singleProductPage/:id',userController.singleProductPage)

router.post('/changeQuantity',userSession.ifUser,productController.productQuantityIncreaseOrDecrease)

router.get('/deleteFromCart/:id/:quantity',userSession.ifUser,productController.deleteFromCart)

router.get('/checkOutPage',userSession.ifUser,orderController.checkOutPage)

router.get('/changeAddress',userSession.ifUser,orderController.changeAddress)

router.get('/checkOutAddAddress',userSession.ifUser,orderController.checkOutAddAddressPage)

router.post('/checkOutAddAddress',userSession.ifUser,orderController.checkOutAddAddress)

router.get('/deleteCheckOutAddress/:id',userSession.ifUser,orderController.deleteCheckOutAddress)

router.get('/editCheckOutAddress/:id',userSession.ifUser,orderController.editCheckOutAddress)

router.post('/updateCheckOutAddress/:id',userSession.ifUser,orderController.updateCheckOutAddress)

router.get('/selectAddress/:id',userSession.ifUser,orderController.selectAddress)

router.post('/placeOrder',userSession.ifUser,orderController.placeOrder)

router.get('/orderHistory',userSession.ifUser,userController.orderHistory)

router.get('/userOrderUpdate/:id/:product_id/:quantity',ifUser,orderController.userOrderUpdate)

router.get('/getWhishList',ifUser,userController.getWishList)

router.get('/addToWhishList/:id',ifUser,userController.addToWishList)

router.get('/removeFromWishList/:id',ifUser,userController.removeFromWishList)

router.get('/addToCartFromWishList/:id/:wishId',ifUser,userController.addToCartFromWishList)

router.post('/couponApply',ifUser,orderController.couponApply)








module.exports = router;

