const Review= require("./models/reviews");
const Listing= require("./models/listing");
const User= require("./models/user");

module.exports.isloggedIn= (req,res,next)=>{
    console.log(req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    next();
    
}

//page store middleware
module.exports.saveRedirectUrl= (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
}

//middleware to check if the user is the owner of the listing
module.exports.isOwner= async(req,res,next)=>{
    const {id}= req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found");
        return res.redirect(`/home`);
    }
    if(!listing.owner._id.equals(res.locals.currentUser._id)){
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/show/${id}`);
    }


    next();
}


module.exports.isReviewOwner= async(req,res,next)=>{
    let{id,reviewId}= req.params;
    let review= await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error", "You do not have permission to do that");
        console.log("you don't have permission to do that");
        return res.redirect(`/show/${id}`);
    }
    next();
}