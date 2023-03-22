// const db = require('../config/connection')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const collections = require('../models/collections')
const bcrypt = require('bcrypt')
const { resolve } = require('promise')
const categoryModel = require('../models/categoryModel')
const Razorpay = require('razorpay');



module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            let block = false, address_id = Date.now()
            let { name, email, mob_no, password, address, pincode } = userData
            userModel.create({ name, email, mob_no, password, block, address: [{ name, email, mob_no, address, pincode, address_id }],wallet:0 }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    doLogin: (userData) => {
        let response = {
            status: false
        };
        return new Promise(async (resolve, reject) => {
            let user = await userModel.findOne({ email: userData.email })
            if (user && user.block == false) {
                bcrypt.compare(userData.password, user.password).then((result) => {
                    if (result) {
                        response.status = true;
                        response.user = user.name;
                        response.userDetails = user;
                        resolve(response)
                    }
                    else
                        resolve({ status: false })
                }).catch(() => {
                    reject()
                })
            }
            else {
                resolve({ status: false })
            }
        })
    },

    doValidate: (userData) => {
        return new Promise((resolve, reject) => {
            userModel.findOne({ email: userData.email }).then((result) => {
                resolve(result)
            }).catch(() => {
                reject()
            })
        })
    },

    user_searchProduct: (productData,sortValue) => {
        return new Promise(async (resolve, reject) => {
            let category= await categoryModel.findOne({category:new RegExp(productData,'i')},{_id:1})
            let id=category?._id??''
            if(sortValue) {
                await productModel.find({ $and: [{ flag: false }, { $or: [{ product_name: new RegExp(productData, 'i') }, { brandName: new RegExp(productData, 'i') }, { category:{$in:[productData,id]} }] }] }).sort({price:sortValue}).lean().then((result) => {
                    resolve(result)
                })
                .catch(() => {
                    reject()
                })
            }
            else{
                await productModel.find({ $and: [{ flag: false }, { $or: [{ product_name: new RegExp(productData, 'i') }, { brandName: new RegExp(productData, 'i') }, { category:{$in:[productData,id]} }] }] }).lean().then((result) => {
                    resolve(result)
                })
                .catch(() => {
                    reject()
                })
            }
        })


    },



    searchProductWithCategory: (input, category) => {
        return new Promise(async (resolve, reject) => {
            await productModel.find({ $and: [{ category: category }, { flag: false }, { $or: [{ product_name: new RegExp(input, 'i') }, { brandName: new RegExp(input, 'i') }] }] }).lean().then((result) => {
                resolve(result)
            }).catch((err) => {
                reject()
            })
        })

    },




    user_add_to_cart: (user_id, product_id) => {
        return new Promise(async (resolve, reject) => {
            await productModel.findOne({ _id: product_id }, { stockQuantity: 1 }).then(async (result) => {
                if (result.stockQuantity > 0) {
                    let duplicate = false
                    let cart = await userModel.findOne({ _id: user_id }, { user_cart: 1, _id: 0 })
                    cart.user_cart.forEach(async element => {
                        if (element.id == product_id) {
                            duplicate = true
                            if (element.quantity < 10) {
                                await userModel.updateOne({ _id: user_id, user_cart: { $elemMatch: { id: product_id } } }, { $inc: { 'user_cart.$.quantity': 1 } }).then(async () => {
                                    await productModel.updateOne({ _id: product_id }, { $inc: { stockQuantity: -1 } })
                                    resolve({success:false})
                                }).catch(() => {
                                    reject()
                                })
                            }
                            else {
                                resolve({success:false})
                            }
                        }
                    })
                    if (!duplicate) {
                        await userModel.updateOne({ _id: user_id }, { $addToSet: { user_cart: { id: product_id, quantity: 1 } } }, { upsert: true }).then(async () => {
                            await productModel.updateOne({ _id: product_id }, { $inc: { stockQuantity: -1 } })
                            resolve({success:true})
                        }).catch(() => {
                            reject()
                        })
                    }

                }
                else {
                    resolve({success:false})
                }
            }).catch(() => {
                reject()
            })
        })
    },

    get_userDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            await userModel.findOne({ _id: id }).lean().then((result) => {
                resolve(result)
            }).catch(() => {
                reject()
            })
        })
    },

    user_addAddress: (user_id, userData) => {
        return new Promise(async (resolve, reject) => {
            userData.address_id = Date.now()
            await userModel.updateOne({ _id: user_id }, { $addToSet: { address: userData } }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    user_delete_address: (userId, address_Idd) => {
        return new Promise((resolve, reject) => {
            userModel.updateOne({ _id: userId }, { $pull: { address: { address_id: address_Idd } } }, { multi: true }).then((result) => {
                resolve(result)
            }).catch(() => {
                reject()
            })
        })
    },

    getAddress: (id, addressId) => {
        return new Promise(async (resolve, reject) => {
            let { address } = await userModel.findOne({ _id: id }, { address: 1 })
            let data = address.find(e => e.address_id == addressId)
            resolve(data)
        })
    },

    addressUpdate: (address_Idd, data) => {
        data.address_id = Date.now()
        return new Promise((resolve, reject) => {
            userModel.updateOne({ address: { $elemMatch: { address_id: address_Idd } } }, { $set: { 'address.$': data } }).then((result) => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    singleProductDetails: (id) => {
        return new Promise((resolve, reject) => {
            productModel.findOne({ _id: id }).lean().then((result) => {
                resolve(result)
            }).catch(() => {
                reject()
            })
        })
    },

    cartProductDatas: (id) => {
        return new Promise(async (resolve, reject) => {
            let cart = await userModel.findOne({ _id: id }, { user_cart: 1 })
            let result = await userModel.findOne({ _id: id })
            let cartQuantities = {}
            const cartID = result.user_cart.map(item => {
                cartQuantities[item.id] = item.quantity
                return item.id
            })
            let cartData = await productModel.find({ _id: { $in: cartID } }).lean()
            let cartDatas = cartData.map((item, index) => {
                return { ...item, quantity: cartQuantities[item._id] }
            })
            let sum = 0;
            cartDatas.forEach(item => {
                sum = sum + parseInt(item.price) * item.quantity
            })
            cartDatas.totalAmount = sum
            resolve(cartDatas)
        })
    },

    generateRazorPay:(orderId,total)=>{
        const instance = new Razorpay({
            key_id:"rzp_test_OyYcdgZL72bzUl",
            key_secret:"mpif2nSNnpA4zv05FD6rXoIp"
          });
        return new Promise((resolve, reject) => {
            const options={
                amount: total*100,
                currency: "INR",
                receipt: orderId 
            };
              instance.orders.create(options,(err,order)=>{
                resolve(order)
               });
        })

    }


}


