let count=60
let countdown=setInterval(()=>{
    console.log(count--)
    if(count==55){
        clearInterval(countdown)
    }
},1000)

