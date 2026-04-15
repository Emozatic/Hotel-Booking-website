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
module.exports.isOwner= (req,res,next)=>{
    const {id}= req.params;
    const listing= Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    if(!listing.owner._id.equals(currentUser._id)){
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/listings/${id}`);
    }


    next();
}