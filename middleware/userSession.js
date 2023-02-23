
module.exports={
    ifUser:(req,res,next)=>{
    if(req.session.user){
        next();
    }
    else{
        res.redirect('/') 
    }
},

ifNoUser:(req,res,next)=>{
    if(req.session.user){
        res.redirect('/')
    }
    else{
        next()
    }
}

}