const mongoose= require("mongoose");
const { type } = require("node:os");
const {Schema}= mongoose;


const listingSchema= new Schema({
    title:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,
    },
    image:{
        type:String,
        set:((v)=>v===" "? "default link": v)
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review"
    }]

})

const Listing= mongoose.model("Listing", listingSchema);
module.exports= Listing;