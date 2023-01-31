// const nodemailer = require("nodemailer");

// const sentOTP=(email, otp)=> {
//     return new Promise((resolve, reject)=>{
//         let transporter = nodemailer.createTransport({
//             host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
//             port: 465, // Port for SMTP (usually 465)
//             secure: true, // Usually true if connecting to port 465
//             auth: {
//               user: 'abijithsurendran005@gmail.com', // Your email address
//               pass: 'abijiths005', // Password (for gmail, your app password)
//             },
//           });
//             var mailOptions={
//               from: process.env.EMAIL,
//               to: 'abijithsurendran005@gmail.com',
//               subject: "GADGETZON Email verification",
//               html: `-
//               <h1>Verify Your Email For GADGETZON</h1>
//                 <h3>use this code to verify your email</h3>
//                 <h2>${otp}</h2>
//               `,
//             }
        
//             transporter.sendMail(mailOptions, function (error, info) {
//               if (error) {
//                   reject(error)
//                 } else {
//                 resolve(otp)
//                 }
//             });
//     })
// }


// sentOTP('abijithsurendran005@gmail.com',1234)
// //  module.exports=sentOTP;