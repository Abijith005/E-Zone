const express=require('express')
const router=express.Router()
const adminController=require('../controller/adminController')
const bcrypt=require('bcrypt')
var datas;
router.get('/',(req,res)=>{
res.render('admin_login')
})
router.post('/admin_login',(req,res)=>{
    adminController.adminLogin().then((data)=>{
        if(req.body.admin_name==data.email&&req.body.password==data.password){
    res.redirect('admin_home') 
        }
        else
        res.redirect('/admin')
    })
})
router.get('/admin_home',(req,res)=>{
    res.render('admin_home')
})

router.get('/admin_products',(req,res)=>{
    adminController.list_product().then((result)=>{
            res.render('product',{result})
    })
})

router.get('/user_Details',(req,res)=>{
    adminController.user_details().then((result)=>{
        if(datas){
            result=datas
        }
        
        res.render('user_Details',{result})
        datas=null;
    })
})

router.get('/order_Details',(req,res)=>{
    res.render('order_Details')
})


router.get('/user_Block/:id',(req,res)=>{
    adminController.block_user(req.params)
        res.redirect('/admin/user_Details')
    
})

router.get('/user_Unblock/:id',(req,res)=>{
    adminController.unblock_user(req.params)
    res.redirect('/admin/user_Details')
})

router.get('/product_edit/:id',async(req,res)=>{
    let data=await adminController.findToUpdate(req.params)
    res.render('edit_product',{data})
})

router.post('/product_edit/:id',async(req,res)=>{
     adminController.update_product(req.params.id,req.body)
        res.redirect('/admin/admin_products')

})


router.get('/product_add',(req,res)=>{
    res.render('add_product')
})

router.post('/product_add',(req,res)=>{
    adminController.add_product(req.body)
    res.redirect('/admin/admin_products')
})

router.get('/product_flag/:id',(req,res)=>{
    adminController.flag_product(req.params)
    res.redirect('/admin/admin_products')
})

router.get('/product_unflag/:id',(req,res)=>{
    adminController.unflag_product(req.params)
    res.redirect('/admin/admin_products')
})

router.post('/user_search',(req,res)=>{
    adminController.user_search(req.body).then((result)=>{
datas=result;
        res.redirect('/admin/user_Details')
    })
})

router.get('/category',(req,res)=>{
    res.render('category')
})

module.exports= router;


