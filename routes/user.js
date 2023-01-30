const express=require('express')
const router=express.Router()
const userController=require('../controller/userController')


router.get('/',userController.user_home)

router.get('/user_login',userController.user_login)

router.post('/user_signIn',userController.user_signin)

router.post('/signup_OTP',userController.user_otp)

router.get('/user_signup',userController.user_signup)

router.get('/forgot_password',userController.user_forgotPassword)

router.get('/signup_otp',userController.user_otp)

router.post('/submit_forgotOTP',userController.user_submitOtp)



module.exports=router;


