const express=require('express')
const router=express.Router()
const userController=require('../controller/userController')
let invalidUser;
router.get('/',(req,res)=>{
    res.render('user_home')
})

router.get('/user_home',(req,res)=>{
    res.render('user_home')
})

router.get('/user_login',(req,res)=>{
    if(invalidUser){
        res.render('user_login',{invalidUser})
        invalidUser=false;
    }
    else
    res.render('user_login')
})

router.post('/user_signIn',(req,res)=>{
    userController.doLogin(req.body).then((result)=>{
        if(result.status){
            res.redirect('/user_home')
        }
        else{
            invalidUser=true;
            res.redirect('/user_login')
        }
    })
})

router.post('/signup_OTP',(req,res)=>{
    userController.doValidate(req.body).then((result)=>{
        if(result){
res.redirect('/user_signup')
        }
        else{
            userController.doSignup(req.body).then((data)=>{
                res.redirect('/signup_otp')
            })  
        }
    })

})

router.get('/user_signup',(req,res)=>{
    res.render('user_signup')
})

router.get('/forgot_password',(req,res)=>{
    res.render('forgot_password')
})

router.get('/signup_otp',(req,res)=>{
    res.render('signup_OTP')
})

router.post('/submit_forgotOTP',(req,res)=>{
    res.send(req.body)
})



module.exports=router;


