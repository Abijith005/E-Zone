let a=Date.now().toString()
console.log(a);



if (item.whishList) {
    a = `<button onclick="removeFromWhishList('${item._id}')" class="add-to-wishlist"><i
                style="color: red;" class="fa fa-heart" aria-hidden="true"></i></i></span></button>
        <button onclick="window.location.href='/singleProductPage/${item._id}'"
            class="quick-view"><i class="fa fa-eye"></i><span class="tooltipp">quick
                view</span></button>`
}
else {
    a = `<button  onclick="addToWhishList('${item._id}')"
            class="add-to-wishlist"><i class="fa fa-heart-o"></i><span class="tooltipp">add to
                wishlist</span></button>
        <button class="quick-view" onclick="window.location.href='/singleProductPage/${item._id}'" ><i class="fa fa-eye"></i><span class="tooltipp">quick
                view</span></button>`
}



{/* <select class="input-select" id="filter">`
							<option value="" selected>Filter by Brand</option>
							{{#each brands.brandName}}
							<option value="{{this}}">{{this}}</option>
							{{/each}}
						</select> */}




                    //     <div class="container" style=" height: 100vh;">
                    //     <div class="text-center mt-3">
                    //         <p style="color:rgb(225,171,43); font-size:3.5rem;font-weight: 600; font-family:it"><span
                    //                 style="color: #ffff;">E-</span> Zone</p>
                    //     </div>
                    //     <div class="row" style="padding-top:1rem;display: flex; justify-content: center;">
                    //         <div class="col"
                    //             style="border-style: solid; height:33rem ; max-width:45%;display: flex; border-radius: 2rem; background-color: rgba(129, 129, 129);">
                    //             <div style="width:100%;">
                    //                 <div style="margin-top:1rem;text-align: center;">
                    //                     <h3 style="margin-top:1rem;">Reset Password</h3>
                    //                 </div>
                    //                 {{#if message}}
                    //                 {{!-- {{#unless matchPassword}}
                    //                 <h2 style="color: rgb(219, 187, 47);">Password Not Matching</h2>
                    //                 {{/unless}} --}}
                    //                 <form action="/resetPassWord" method="post" class="text-center">
                    //                     <label class="mt-4 mb-1" for="">New Password :</label><br>
                    //                     <input type="password" name="newPassword" class="form-control-lg mb-2"><br>
                    //                     <label class="my-1" for="">Confirm Password :</label><br>
                    //                     <input type="password" name="confirmPassword" class="form-control-lg mb-2"><br><br><br>
                    //                     <button type="submit" class="btn btn-success rounded-pill">Submit</button>
                    //                 </form>
                    //                 {{else}}
                    //                 {{#unless display}}
                    //                 <form action="submit_mailForgotPassword" method="post">
                    //                     <div class="mt-4" style="text-align: center;">
                    //                         <input style="width:70%;" class="form-control-lg" type="email" name="email"
                    //                             placeholder="Email-id"><br>
                    //                         <div id="otpbutton">
                    //                             <button class="btn rounded-pill my-3 text-white" type="submit"
                    //                                 style="background-color: rgb(4, 110, 4);" onclick="countDown()">Get OTP</button>
                    //                         </div>
                    //                     </div>
                    //                 </form>
                    //                 {{else}}
                    //                 <form action="submit_forgotOTP" method="post">
                    //                     <div style="text-align: center;">
                    //                         <h5 class="my-3">OTP Verification :</h5>
                    //                         <input style="width:40%;" class="form-control-lg" type="text" maxlength="6" minlength="6"
                    //                             name="otp">
                    //                         <p class="my-2">Enter the OTP send to your mail id</p>
                    //                     </div>
                    //                     <div class="text-center mt-3 " style="color: rgb(10, 65, 100);" id="otpdiv"></div>
                    //                     <div class="text-center">
                    //                         <button class="btn rounded-pill mt-5 text-white" type="submit"
                    //                             style="background-color: rgb(4, 110, 4);">Submit</button>
                    //                 </form>
                    //                 {{/unless}}
                    //                 {{/if}}
                    //             </div>
                    //         </div>
                    //     </div>
                    // </div>  