// const db = require('../config/connection')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const collections = require('../models/collections')
const bcrypt = require('bcrypt')
const ObjectId = require('mongodb').ObjectId
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            let block = false, address_id = Date.now()
            let { name, email, mob_no, password, address, pincode } = userData
            userModel.create({ name, email, mob_no, password, block, address: [{ name, email, mob_no, address, pincode, address_id }] }).then((data) => {
                resolve(data)
            })
            // db.get().collection(collections.USER_COLLECTION).insertOne({ name, email, mob_no, password, block, user_cart: [], user_wishList: [], address: [{ name, email, mob_no,address, pincode, address_id }] }).then((data) => {
            //     resolve(data)

            // })
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
            })
        })
    },



    user_searchProduct: (productData) => {
        return new Promise(async (resolve, reject) => {
            await productModel.find({ $and: [{ flag: false }, { $or: [{ product_name: new RegExp(productData, 'i') }, { brandName: new RegExp(productData, 'i') }, { category: new RegExp(productData, 'i') }] }] }).lean().then((result) => {
                resolve(result)

            })
        })


    },



    searchProductWithCategory: (input, category) => {
        return new Promise(async (resolve, reject) => {
            await productModel.find({ $and: [{ category: category }, { flag: false }, { $or: [{ product_name: new RegExp(input, 'i') }, { brandName: new RegExp(input, 'i') }] }] }).lean().then((result) => {
                resolve(result)
            })
        })

    },




    user_add_to_cart: (user_id, product_id) => {
        return new Promise(async (resolve, reject) => {
            let duplicate=false
            let cart = await userModel.findOne({ _id: user_id }, { user_cart: 1, _id: 0 })
            cart.user_cart.forEach(async element => {
                if (element.id == product_id) {
                    duplicate=true
                    console.log('element matched');
                    await userModel.updateOne({ _id: user_id, user_cart: { $elemMatch: { id: product_id } } }, { $inc: { 'user_cart.$.quantity': 1 } })
                }
            });
            if(!duplicate){
console.log('not duplicate');
                let quantity = 1
                await userModel.updateOne({ _id: user_id }, { $addToSet: { user_cart: { id: product_id, quantity: 1 } } }, { upsert: true })
                resolve()
            }
        })
    },





    get_userDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            await userModel.findOne({ _id: id }).lean().then((result) => {
                resolve(result)
            })

        })


    },



    user_addAddress: (user_id, userData) => {
        return new Promise(async (resolve, reject) => {
            // let { address } = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(user_id) }, { address: 1 })
            // address.forEach(element => {
            //     if (element == userData) {
            //         console.log(element);
            //     }
            //     else {
            //         console.log("dfdf");
            //     }

            // });
            // console.log({ address });
            userData.address_id = Date.now()
            await userModel.updateOne({ _id: user_id }, { $addToSet: { address: userData } }).then(() => {
                resolve()
            })



        })
    },

    user_delete_address: (userId, address_Idd) => {

        return new Promise((resolve, reject) => {
            userModel.updateOne({ _id: userId }, { $pull: { address: { address_id: address_Idd } } }, { multi: true }).then((result) => {
                resolve(result)
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

            })
        })
    },

    singleProductDetails: (id) => {
        return new Promise((resolve, reject) => {
            productModel.findOne({ _id: id }).lean().then((result) => {
                resolve(result)
            })
        })
    }


}


