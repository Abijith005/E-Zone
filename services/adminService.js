// const db = require('../config/connection')
const sharp = require('sharp')
const adminModel = require('../models/adminModel')
const categoryModel = require('../models/categoryModel')
const collections = require('../models/collections')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
module.exports = {
    adminLogin: () => {
        return new Promise((resolve, reject) => {
            var data = adminModel.findOne({ name: 'admin' })
            resolve(data)
        })
    },

    user_details: () => {
        return new Promise(async (resolve, reject) => {
            await userModel.find().sort({ name: 1 }).lean().then((result) => {

                resolve(result)
            }).catch(() => {
                reject()
            })

        })
    },

    block_user: (id) => {
        return new Promise((resolve, reject) => {
            userModel.updateOne({ _id: id }, { $set: { block: true } }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    unblock_user: (id) => {
        return new Promise((resolve, reject) => {
            userModel.updateOne({ _id: id }, { $set: { block: false } }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    add_product: (productData, imag) => {
        productData.flag = false;
        return new Promise((resolve, reject) => {
            categoryModel.findOne({ category: productData.category }).then((result) => {
                productData.category = result._id
                // sharp(imag.image[0].filename)

                //     .resize(300, 300, {
                //         kernel: sharp.kernel.nearest,
                //         fit: 'contain',
                //         position: 'center',
                //         background: { r: 255, g: 255, b: 255, alpha: 0 }
                //     })
                //     .toFile('output5.png')
                //     .then(() => {
                //         // output.png is a 200 pixels wide and 300 pixels high image
                //         // containing a nearest-neighbour scaled version
                //         // contained within the north-east corner of a semi-transparent white canvas
                //         console.log("success")
                //     })
                productModel.create({ ...productData, ...imag }).then(() => {
                    resolve()
                })
                // }).catch(()=>{
                //     reject()
            })
        })

    },

    list_product: () => {
        return new Promise(async (resolve, reject) => {
            let result = await productModel.find().sort({ name: 1 }).lean()
            for (const i of result) {
                let data = await categoryModel.findOne({ _id: i.category })
                i.category = data.category
            }
            resolve(result)
        })

    },

    findToUpdate: (id) => {
        return new Promise(async (resolve, reject) => {
            let result = await productModel.findOne({ _id: id }).lean()
            resolve(result)
        })
    },

    update_product: (id, productData, files) => {
        return new Promise((resolve, reject) => {
            productModel.updateOne({ _id: id }, { $set: { product_name: productData.product_name, category: productData.category, company: productData.company, price: productData.price, stockQuantity: productData.stockQuantity, product_Details: productData.product_Details, image: files.image } }).then((result) => {
                console.log(result);
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    flag_product: (id) => {
        return new Promise((resolve, reject) => {
            productModel.updateOne({ _id: id }, { $set: { flag: true } }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    unflag_product: (id) => {
        return new Promise((resolve, reject) => {
            productModel.updateOne({ _id: id }, { $set: { flag: false } }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },


    user_search: (userData) => {
        return new Promise(async (resolve, reject) => {
            await userModel.find({ $or: [{ name: new RegExp(userData.name, 'i') }, { email: userData.name }, { mob_no: userData.name }] }).lean().then((result) => {
                resolve(result)
            }).catch(() => {
                reject()
            })
        })
    },

    addCategory: (categoryData) => {
        return new Promise(async (resolve, reject) => {
            let flag = false;
            await categoryModel.create({ ...categoryData, flag })
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
            }).catch(() => {
                reject()
            })

        })
    },

    categoryUpdate: (id, categoryData) => {
        categoryData.brandName = categoryData.brandName.split(',')
        return new Promise(async (resolve, reject) => {
            await categoryModel.updateOne({ _id: id }, { $set: { category: categoryData.category, brandName: categoryData.brandName } }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    }



}