const mongoose = require('mongoose')

let bannerSchema = new mongoose.Schema({

    bannerName: {
        type: String,
        required: true
    },

    image: {
        type: Array,
        required: true
    },

    target: {
        type: String,
        required: true
    },

    flag:{
        type:Boolean,
        default:false
    }

})

let bannerModel = mongoose.model('banner', bannerSchema)
module.exports = bannerModel
