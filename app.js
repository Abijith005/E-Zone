const express=require('express')
const app=express();
const exphbs=require('express-handlebars')
const path=require('path')
const db=require('./config/connection')
var usersRouter=require('./routes/user')
var adminRouter=require('./routes/admin')
var bodyParser = require('body-parser')
var cookieParser=require('cookie-parser');
const session = require('express-session');

app.use((req,res,next)=>{
    // if(!req.user)
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      next();
  })

db.connect((err)=>{
    if(err){
    console.log('data base not connected'+err);
    }

})
//setting session
app.use(session({
    secret:'secret',
    saveUninitialized:false,
    resave:true
}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//routes
app.use('/admin',adminRouter)
app.use('/',usersRouter)

//setting engine
app.engine('handlebars',exphbs.engine());
app.set('view engine','handlebars')
//settng directory
app.set('views',[path.join(__dirname,'views/user_views'),path.join(__dirname,'views/admin_views')])
app.use(express.static(path.join(__dirname,'public')))

//setting port
app.listen(5000,console.log('server running http://localhost:5000'))

module.exports=app;