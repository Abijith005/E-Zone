const mongoose = require('mongoose')

let couponSchema = new mongoose.Schema({

    couponName: {
        type: String,
        required: true
    },

    couponCode: {
        type: String,
        required: true
    },

    minPurchaseAmount: {
        type: Number,
        required: true
    },

    discountAmount: {
        type: Number,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    couponStatus: {
        type: Boolean,
        required: true
    }

})

let couponModel = mongoose.model('coupon', couponSchema)
module.exports = couponModel;