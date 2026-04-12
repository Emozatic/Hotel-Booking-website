const express= require("express");
const app= express();
const mongoose= require("mongoose");
const {Schema}= mongoose;
const path= require("path")
const Listing= require("./models/listing");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError= require("./utils/ExpressError");
const wrapAsync= require("./utils/wrapAsync");
const validateId= require("./utils/validation").validateId
//const validateListing= require("./utils/validation").validateListing;
const {listingSchemaData,reviewSchema}=require("./schema");
const Review= require("./models/reviews");
main()
.then((res)=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect("mongodb://localhost:27017/booking2");
}


app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


//middleware for validating listing data using Joi
const validateListing= (req,res,next)=>{    
    const { error } = listingSchemaData.validate(req.body);
    if (error) {
        throw new ExpressError(error.message, 400);
    }
    next();
};

//middleware for validation of comment using joi
const validateReview= (req,res,next)=>{
    const{error}= reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(error.message, 400);
    }
    next();
}

//index route
app.get("/home",validateListing,wrapAsync(async(req,res)=>{
    const listings= await Listing.find({});
    console.log(listings);
    res.render("home.ejs",{listings});
}))

//show route
app.get("/home/:id",validateId,validateListing,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    let listing= await Listing.findById(id).populate("reviews");
    console.log(listing);
    res.render("show.ejs",{listing});
}))

//create route
app.get("/new",(req,res)=>{
    res.render("new.ejs");
})

app.post("/home",validateListing,wrapAsync(async(req,res)=>{
    const newListing= new Listing(req.body.listing);
    console.log(req.body.listing);
    await newListing.save().then((result)=>{console.log(result)}).catch((err)=>{console.log(err)}); 
    res.redirect("/home");
}))


//edit route
app.get("/edit/:id",validateId,validateListing,wrapAsync(async(req,res)=>{
    let{id}= req.params;
    let listing= await Listing.findById(id);
    res.render("edit.ejs",{id,listing});
}));

//post edit route
app.put("/edit/:id",validateId,validateListing,wrapAsync(async(req,res)=>{   
    let {id}= req.params;
    let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/home");
}))

//delete route
app.delete("/delete/:id",validateId,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/home");
}));

//review route
app.post("/home/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id);
    let newReview= new Review(req.body.review);
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    
    res.redirect(`/home/${id}`);
}))


//Delete review route
app.delete("/home/:id/reviews/:reviewId",validateId,wrapAsync(async(req,res)=>{
    let {id, reviewId}= req.params; ///home/:listingId/reviews/:reviewId
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/home/${id}`);
}));

//cusotm error handler
app.use((req,res,next)=>{
    next(new ExpressError("Page Not Found",404));
})


//error handling middleware
app.use((err,req,res,next)=>{
    console.log("------ERROR------");
    console.log(err);
    let{status=500,message="An error occurred"}= err;
    console.log(`Status: ${status}, Message: ${message}`);
    res.render("error.ejs",{err});

})

app.listen(8000,()=>{
    console.log("server is running on port 8000");
})