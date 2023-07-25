function test1(){
    
    setTimeout(()=>{
    console.log("test1")
    },5000)
}
    
    
function test2(){
    test1();
    console.log("test2")
}



test2();

