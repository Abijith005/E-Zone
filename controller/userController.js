const userService=require('../services/userService')
let invalidUser;

module.exports={

    user_home:(req,res)=>{
        res.render('user_home')
    },


    user_login:(req,res)=>{
        if(invalidUser){
            res.render('user_login',{invalidUser})
            invalidUser=false;
        }
        else
        res.render('user_login')
    },

    user_signin:(req,res)=>{
        userService.doLogin(req.body).then((result)=>{
            if(result.status){
                res.redirect('/')
            }
            else{
                invalidUser=true;
                res.redirect('/user_login')
            }
        })
    },

    user_signUp:(req,res)=>{
        userService.doValidate(req.body).then((result)=>{
            console.log('hai');
            if(result){
    res.redirect('/user_signup')
            }
            else{
                userService.doSignup(req.body).then((data)=>{
                    res.redirect('/signup_otp')
                })  
            }
        })
    
    },

    user_signUpPage:(req,res)=>{
        res.render('user_signup')
    },

    user_forgotPassword:(req,res)=>{
        res.render('forgot_password')
    },

    user_otp:(req,res)=>{
        res.render('signup_OTP')
    },

user_submitOtp:(req,res)=>{
    res.send(req.body)
}
    
}