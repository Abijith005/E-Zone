// const MongoClient=require('mongodb').MongoClient
// const state={
//     db:null
// }


// module.exports.connect=(done)=>{
//     const url='mongodb://127.0.0.1:27017'
//     const dbname='adminDatas'
//     MongoClient.connect(url,(err,data)=>{
// if(err){
//     return done(err)
// }
// else{
//     state.db=data.db(dbname)
//     done();

// }
//     })
// }

// module.exports.get=()=>{
//     return state.db
// }


// ******************************mongoose*************************//

const mongoose = require('mongoose');

const dbConnect=()=>{
    mongoose.set('strictQuery', true);
    mongoose.connect('mongodb://127.0.0.1:27017/E-Zone')
    .then(() => console.log('Connected!')).catch(err=>{
        console.log("error : ", err)
    })
}


module.exports= dbConnect;