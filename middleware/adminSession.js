module.exports={
    ifAdmin:(req,res,next)=>{
    if(req.session.admin){
        next();
    }
    else{
        res.redirect('/admin')    }
},

ifNoAdmin:(req,res,next)=>{
    if(req.session.admin){
        res.redirect('/admin')    }
    else{
        next()
    }
}

}