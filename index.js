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
//const validateId= require("./utils/validation").validateId
//const validateListing= require("./utils/validation").validateListing;
const {listingSchemaData,reviewSchema}=require("./schema");
const Review= require("./models/reviews");
const cookieParser= require("cookie-parser");
const session= require("express-session");
const flash= require("connect-flash");
const LocalStretegy= require("passport-local");
const passport= require("passport");
const User= require("./models/user");
const {isloggedIn}= require("./middleware");
main()
.then((res)=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect("mongodb://localhost:27017/booking2");
}


//session option
const sessionOption={
    secret:"supersecret",
    resave:false,
    saveunitialized:true,
     cookie:{
        expires:Date.now()+7*24*60*60*1000,
        httpOnly:true,
     }
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(cookieParser("secretCode"));
app.use(session(sessionOption));
app.use(flash());

//passport options
app.use(passport.initialize()); //initialize passport
app.use(passport.session()); //help to check user if the page changed
passport.use(new LocalStretegy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for flash messages and store user info in res.locals
app.use((req,res,next)=>{
    res.locals.successMsg= req.flash("success");
    res.locals.errorMsg= req.flash("error");
    res.locals.currentUser= req.user;
    next();
})


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
app.get("/home/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    let listing= await Listing.findById(id).populate("reviews");
    console.log(listing);
    res.render("show.ejs",{listing});
}))

//create route
app.get("/new",isloggedIn,(req,res)=>{
    res.render("new.ejs");
})

app.post("/home",isloggedIn,validateListing,wrapAsync(async(req,res)=>{
    const newListing= new Listing(req.body.listing);
    console.log(req.body.listing);
    await newListing.save().then((result)=>{console.log(result)}).catch((err)=>{console.log(err)}); 
    res.redirect("/home");
    req.flash("success","new Listing added");
}))


//edit route
app.get("/edit/:id",isloggedIn,validateListing,wrapAsync(async(req,res)=>{
    let{id}= req.params;
    let listing= await Listing.findById(id);
    res.render("edit.ejs",{id,listing});
}));

//post edit route
app.put("/edit/:id",isloggedIn,validateListing,wrapAsync(async(req,res)=>{   
    let {id}= req.params;
    let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/home");
}))

//delete route
app.delete("/delete/:id",isloggedIn,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/home");
}));

//review route
app.post("/home/:id/reviews",isloggedIn,validateReview,wrapAsync(async(req,res)=>{
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
app.delete("/home/:id/reviews/:reviewId",isloggedIn,wrapAsync(async(req,res)=>{
    let {id, reviewId}= req.params; ///home/:listingId/reviews/:reviewId
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/home/${id}`);
}));


//signup route
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})

app.post("/signup",wrapAsync(async(req,res)=>{
    try{
        const {email,username}= req.body;
    const newUser= new User({email,username});
    const registeredUser= await User.register(newUser, req.body.password);
    console.log(registeredUser);
    req.flash("success","Welcome to Booking App");
    res.redirect("/home");
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
}))

//login route
app.get("/login",(req,res)=>{
    res.render("login.ejs");
});

//post login route
app.post("/login",passport.authenticate("local",{
    failureFlash:true,
    failureRedirect:"/login"}),wrapAsync(async(req,res)=>{
    req.flash("success","Welcome back!");
    res.redirect("/home");
}));

//post logout rote
app.post("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged out successfully");
        res.redirect("/home");
    })
})


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