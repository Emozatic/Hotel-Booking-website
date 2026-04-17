const mongoose= require("mongoose");
const { type } = require("node:os");
const {Schema}= mongoose;
const Review= require("./reviews");


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
        url:String,
        filename:String
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review"
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }

})

const Listing= mongoose.model("Listing", listingSchema);
module.exports= Listing;

//post middelware for deleting review from listing
listingSchema.post("findOneAndDelete", async function(listing){
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});