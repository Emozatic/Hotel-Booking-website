const mongoose= require("mongoose");
const ExpressError= require("./ExpressError");

module.exports.validateId= ((req,res,next)=>{
    let {id}= req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ExpressError("Invalid ID format",400);
    }
    next();
});

module.exports.validateListing= (listing)=>{
    if(!listing){
        throw new ExpressError("listing not found",404);
    }
}