
module.exports = process.on("uncaughtException",async (error)=>{
    let errors= error.message + error.stack;   
    console.log('uncaught error',errors);
});