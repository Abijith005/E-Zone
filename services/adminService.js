const db = require('../config/connection')
const collections = require('../models/collections')
const ObjectId = require('mongodb').ObjectId
module.exports = {
    adminLogin: () => {
        return new Promise((resolve, reject) => {
            var data = db.get().collection(collections.ADMIN_COLLECTION).findOne({ name: 'admin' })
            resolve(data)

        })
    },
    user_details: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).find().sort({ name: 1 }).toArray().then((result) => {
                resolve(result)
            })

        })
    },
    block_user: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { block: true } })
        })
    },
    unblock_user: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { block: false } })
        })
    },
    add_product: (productData, image) => {
        productData.flag = false;
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).insertOne({ ...productData, image })
        })
    },
    list_productOrCategory: (argCollection) => {
        return new Promise((resolve, reject) => {
            db.get().collection(argCollection).find().sort({ name: 1 }).toArray().then((result) => {
                resolve(result)

            })
        })
    },
    findToUpdate: (id,collectionn) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collectionn).findOne({ _id: ObjectId(id) }).then((result) => {
                resolve(result)
            })
        })
    },

    update_product: (id, productData, files) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { product_name: productData.product_name, category: productData.category, company: productData.company, price: productData.price, product_Details: productData.product_Details, image: files } })
        })
    },

    flag_product: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { flag: true } })
        })
    },

    unflag_product: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { flag: false } })
        })
    },

    user_search: (userData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).find({ $or: [{ name: new RegExp(userData.name, 'i') }, { email: userData.name }, { mob_no: userData.name }] }).toArray().then((result) => {
                resolve(result)
            })
        })
    },

    addCategory: (categoryData) => {
        return new Promise((resolve, reject) => {
            let flag = false;
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne({ ...categoryData, flag })
        })
    },

    flag_or_unflagCategory: (id) => {
        let flag = true;
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).findOne({ _id: ObjectId(id) }).then((data) => {
                if (data.flag == true) {
                    flag = false
                }
                db.get().collection(collections.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { flag: flag } }).then(()=>{
                    resolve()
                })
            })

        })
    },

    categoryUpdate:(id,categoryData)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{category:categoryData.category,brandName:categoryData.brandName}})
        })
    }


}