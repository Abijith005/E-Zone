const express=require('express')
const router=express.Router()
const userController=require('../controller/userController')


router.get('/',userController.user_home)

router.get('/user_login',userController.user_login)

router.post('/user_signIn',userController.user_signin)

router.post('/user_signUP',userController.user_signUp)

router.get('/user_signUp',userController.user_signUpPage)

router.get('/forgot_password',userController.user_forgotPassword)

router.get('/signup_otp',userController.user_otp)

router.post('/signup_otp',userController.user_validateSignUpOTP)

router.post('/submit_forgotOTP',userController.user_submitOtp)



module.exports=router;


