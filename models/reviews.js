const mongoose= require("mongoose");

const {Schema}= mongoose;

let reviewSchema= new Schema({
    comment:String,
    rating:{
        type:Number,
        min:1,
        max:5,
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    
})

module.exports= mongoose.model("Review", reviewSchema);