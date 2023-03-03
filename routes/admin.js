const express=require('express')
const router=express.Router()
const adminController=require('../controller/adminController')
const bcrypt=require('bcrypt')
const multiUpload = require('../middleware/multer')
const categoryController = require('../controller/categoryController')
const adminSession=require('../middleware/adminSession')
const { ifAdmin } = require('../middleware/adminSession')
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController')

router.get('/',adminSession.ifNoAdmin,adminController.admin_loginPage)

router.post('/admin_login',adminSession.ifNoAdmin,adminController.admin_login)

router.get('/admin_home',adminSession.ifAdmin,adminController.admin_home)

router.get('/admin_products',adminSession.ifAdmin,adminController.admin_product)

router.get('/user_Details',adminSession.ifAdmin,adminController.admin_userDetails)
 
router.get('/order_Details',adminSession.ifAdmin,adminController.admin_orderDetails)

router.get('/viewOrder/:id',ifAdmin,adminController.viewOrder)

router.get('/user_Block/:id',adminSession.ifAdmin,adminController.admin_userBlock)

router.get('/user_Unblock/:id',adminSession.ifAdmin,adminController.admin_userUnblock)

router.get('/product_edit/:id',adminSession.ifAdmin,adminController.admin_productEditPage)

router.post('/product_edit/:id',adminSession.ifAdmin,multiUpload,adminController.admin_productEdit)

router.get('/product_add',adminSession.ifAdmin,adminController.admin_productAddPage)

router.post('/product_add',multiUpload,adminController.admin_productAdd)

router.get('/product_flag/:id',adminSession.ifAdmin,adminController.admin_productFlag)

router.get('/product_unflag/:id',adminSession.ifAdmin,adminController.admin_productUnflag)

router.post('/user_search',adminSession.ifAdmin,adminController.admin_userSearch)
 
router.get('/category',adminSession.ifAdmin,categoryController.admin_categoryPage)

router.get('/add_categoryPage',adminSession.ifAdmin,categoryController.admin_addCategoryPage)

// router.post('/getCategoryForProduct',adminSession.ifAdmin,categoryController.categoryForProduct)

router.post('/add_category',adminSession.ifAdmin,categoryController.admin_addCategory)

router.get('/flag_and_unFlag_category/:id',adminSession.ifAdmin,categoryController.flagAndUnflag_category)

router.get('/editCategory/:id',adminSession.ifAdmin,categoryController.edit_category)

router.post('/updateCategory/:id',adminSession.ifAdmin,categoryController.update_category)

router.get('/adminOrderUpdate/:id/:user_id/:product_id/:quantity/:update',adminSession.ifAdmin,orderController.adminOrderUpdate)

router.get('/getCoupon',ifAdmin,couponController.getCoupon)

router.get('/addCoupon',ifAdmin,couponController.getAddCoupon)

router.post('/addCoupon',ifAdmin,couponController.addCoupon)

router.get('/getEditCoupon/:id/:status',ifAdmin,couponController.getEditCoupon)

router.post('/editCoupon/:id',ifAdmin,couponController.editCoupon)

router.get('/log_Out',adminController.adminLogOut)



module.exports= router;


