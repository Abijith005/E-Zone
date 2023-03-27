const userModel = require("../models/userModel");

module.exports = {
    ifUser: async (req, res, next) => {
        if (req.session.user) {
            const user = await userModel.findOne({ $and: [{ _id: req.session.userDetails._id }, { block: false }] }).lean()
             if (user) {
                next();
            }
            else {
                req.session.destroy()
                res.redirect('/user_login')
            }
        }
        else {
            res.redirect('/')
        }
    },

    ifNoUser: (req, res, next) => {
        if (req.session.user) {
            res.redirect('/')
        }
        else {
            next()
        }
    }

}