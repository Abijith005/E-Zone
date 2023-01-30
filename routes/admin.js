const express=require('express')
const router=express.Router()
const adminController=require('../controller/adminController')
const bcrypt=require('bcrypt')
var datas;
router.get('/',adminController.admin_loginPage)

router.post('/admin_login',adminController.admin_login)

router.get('/admin_home',adminController.admin_home)

router.get('/admin_products',adminController.admin_product)

router.get('/user_Details',adminController.admin_userDetails)

router.get('/order_Details',adminController.admin_orderDetails)

router.get('/user_Block/:id',adminController.admin_userBlock)

router.get('/user_Unblock/:id',adminController.admin_userUnblock)

router.get('/product_edit/:id',adminController.admin_productEditPage)

router.post('/product_edit/:id',adminController.admin_productEdit)

router.get('/product_add',adminController.admin_productAddPage)

router.post('/product_add',adminController.admin_productAdd)

router.get('/product_flag/:id',adminController.admin_productFlag)

router.get('/product_unflag/:id',adminController.admin_productUnflag)

router.post('/user_search',adminController.admin_userSearch)

router.get('/category',)

module.exports= router;


