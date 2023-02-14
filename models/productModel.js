const mongoose = require('mongoose')

let productSchema = new mongoose.Schema({

    product_name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    brandName: {
        type: String,
        required: true
    },

    product_Details: {
        type: String,
        required: true
    },

    stockQuantity: {
        type: Number,
        required: true
    },

    price: {
        type: String,
        required: true
    },

    flag: {
        type: Boolean,
        required: true
    },

    image: {
        type: Array,
        required: true
    },

    sub_image: {
        type: Array,
        required: true
    }


})

let productModel = mongoose.model('product', productSchema)
module.exports = productModel;

