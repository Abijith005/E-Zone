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