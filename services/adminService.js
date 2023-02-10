// const db = require('../config/connection')
const adminModel = require('../models/adminModel')
const categoryModel = require('../models/categoryModel')
const collections = require('../models/collections')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const ObjectId = require('mongodb').ObjectId
module.exports = {
    adminLogin: () => {
        return new Promise((resolve, reject) => {
            var data = adminModel.findOne({ name: 'admin' })
            resolve(data)

        })
    },
    user_details:() => {
        return new Promise(async(resolve, reject) => {
            await userModel.find().sort({ name: 1 }).lean().then((result)=>{
    
                resolve(result)
            })
            
        })
    },
    block_user: (id) => {
        return new Promise((resolve, reject) => {
            userModel.updateOne({ _id: id }, { $set: { block: true } }).then(() => {
                resolve()
            })
        })
    },
    unblock_user: (id) => {
        return new Promise((resolve, reject) => {
            userModel.updateOne({ _id: id }, { $set: { block: false } }).then(() => {
                resolve()
            })
        })
    },
    add_product: (productData, image) => {
        productData.flag = false;
        return new Promise((resolve, reject) => {
            categoryModel.findOne({ category: productData.category }).then((result) => {
                productData.category = result._id
                productModel.create({ ...productData, ...image }).then(() => {
                    resolve()
                })
            })
        })

    },
    list_productOrCategory: (argCollection) => {
        return new Promise(async (resolve, reject) => {
            let result = await argCollection.find().sort({ name: 1 }).lean()
            result.forEach(async element => {
              await categoryModel.findOne({ _id: element.category }).then((data) => {
                    element.category = data.category
                })
            });
            resolve(result)

        })
    },


    findToUpdate: (id, collectionn) => {
        return new Promise(async (resolve, reject) => {
            let result = await productModel.findOne({ _id: id }).lean()
            resolve(result)
        })
    },

    update_product: (id, productData, files) => {
        return new Promise((resolve, reject) => {
            productModel.updateOne({ _id: id }, { $set: { product_name: productData.product_name, category: productData.category, company: productData.company, price: productData.price, product_Details: productData.product_Details, image: files } }).then(() => {
                resolve()
            })
        })
    },

    flag_product: (id) => {
        return new Promise((resolve, reject) => {
            productModel.updateOne({ _id: id }, { $set: { flag: true } }).then(() => {
                resolve()
            })
        })
    },

    unflag_product: (id) => {
        return new Promise((resolve, reject) => {
            productModel.updateOne({ _id: id }, { $set: { flag: false } }).then(() => {
                resolve()

            })
        })
    },


    user_search:(userData) => {
        return new Promise(async(resolve, reject) => {
            await userModel.find({ $or: [{ name: new RegExp(userData.name, 'i') }, { email: userData.name }, { mob_no: userData.name }] }).lean().then((result) => {
                resolve(result)
            })
        })
    },

    addCategory: (categoryData) => {
        return new Promise((resolve, reject) => {
            let flag = false;
            categoryModel.create({ ...categoryData, flag })
        })
    },


    flag_or_unflagCategory: (id) => {
        let flag = true;
        return new Promise((resolve, reject) => {
            categoryModel.findById({ _id: id }).then((data) => {
                if (data.flag == true) {
                    flag = false
                }
                categoryModel.findByIdAndUpdate({ _id: id }, { $set: { flag: flag } }).then(() => {
                    resolve()
                })
            })

        })
    },

    categoryUpdate: (id, categoryData) => {
        return new Promise((resolve, reject) => {
            categoryModel.updateOne({ _id: id}, { $set: { category: categoryData.category, brandName: categoryData.brandName } }).then(() => {
                resolve()
            })
        })
    }



}