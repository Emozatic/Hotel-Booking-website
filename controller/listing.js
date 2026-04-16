const Listing= require("../models/listing");
const Review= require("../models/reviews");
const {listingSchemaData}= require("../schema");
const ExpressError= require("../utils/ExpressError");
const wrapAsync= require("../utils/wrapAsync");

//home route
module.exports.home=async(req,res)=>{
    const listings= await Listing.find({});
    //console.log(listings);
    res.render("home.ejs",{listings});
}

//show route
module.exports.show=async(req,res)=>{
    let {id}= req.params;
    let listing= await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}})
    let reviews= await Review.find().populate("author");
    console.log(reviews);
    console.log(listing);
    res.render("show.ejs",{listing});
}

//rednder form for new route
module.exports.renderNewForm=(req,res)=>{
    res.render("new.ejs");
}

//post new form
module.exports.createNewListing=async(req,res)=>{
    const newListing= new Listing(req.body.listing);
    console.log(req.body.listing);
    newListing.owner= req.user._id;
    await newListing.save().then((result)=>{console.log(result)}).catch((err)=>{console.log(err)}); 
    res.redirect("/home");
    req.flash("success","new Listing added");
}

//edit route
module.exports.renderEditForm=async(req,res)=>{
    let{id}= req.params;
    let listing= await Listing.findById(id);
    res.render("edit.ejs",{id,listing});
}

//post edit route
module.exports.editListing=async(req,res)=>{   
    let {id}= req.params;
    let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/home");
}

//delete route
module.exports.deleteListing=async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/home");
}