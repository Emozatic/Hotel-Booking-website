const Listing= require("../models/listing");
const Review= require("../models/reviews");
const {listingSchemaData}= require("../schema");
const ExpressError= require("../utils/ExpressError");
const wrapAsync= require("../utils/wrapAsync");


module.exports.createReview= async(req,res)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id);
    let newReview= new Review(req.body.review);
    newReview.author= req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    
    res.redirect(`/show/${id}`);
}

module.exports.deleteReview= async(req,res)=>{
    let {id, reviewId}= req.params; ///home/:listingId/reviews/:reviewId
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/show/${id}`);
}