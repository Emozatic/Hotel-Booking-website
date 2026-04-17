require("dotenv").config();
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
const {saveRedirectUrl}= require("./middleware");
const {isOwner}= require("./middleware");
const{isReviewOwner}= require("./middleware");
const listingController= require("./controller/listing");
const reviewController= require("./controller/review");
const multer= require("multer");
//const upload= multer({dest:"uploads/"});
const {storage}= require("./cloudConfig");
const upload= multer({storage});


//mongoose.set("strictQuery", true);
mongoose.set("strictPopulate", false);
const dbUrl = process.env.NODE_ENV === "test" ? "mongodb://localhost:27017/booking2_test" : "mongodb://localhost:27017/booking2";
main()
.then((res)=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dbUrl);
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
app.get("/home",validateListing,wrapAsync(listingController.home));

//show route
app.get("/show/:id",validateListing,wrapAsync(listingController.show));

//create route
app.get("/new",isloggedIn,listingController.renderNewForm);

app.post("/home",isloggedIn,validateListing,upload.single("listing[image]"),wrapAsync(listingController.createNewListing));


//edit route
app.get("/edit/:id",isloggedIn,validateListing,wrapAsync(listingController.renderEditForm));

//post edit route
app.put("/edit/:id",isloggedIn,isOwner,validateListing,wrapAsync(listingController.editListing));

//delete route
app.delete("/delete/:id",isloggedIn,isOwner,wrapAsync(listingController.deleteListing));

//review route
app.post("/home/:id/reviews",isloggedIn,validateReview,wrapAsync(reviewController.createReview));


//Delete review route
app.delete("/home/:id/reviews/:reviewId",isloggedIn,isReviewOwner,wrapAsync(reviewController.deleteReview));


//signup route
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})

app.post("/signup",wrapAsync(async(req,res,next)=>{
    try{
        const {email,username}= req.body;
    const newUser= new User({email,username});
    const registeredUser= await User.register(newUser, req.body.password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to Booking App");
    res.redirect("/home");
        });
    
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
app.post("/login",saveRedirectUrl,passport.authenticate("local",{
    failureFlash:true,
    failureRedirect:"/login"}),wrapAsync(async(req,res)=>{
    req.flash("success","Welcome back!");
    console.log(res.locals.redirectUrl);
    let redirectUrl= res.locals.redirectUrl || "/home";
    res.redirect(redirectUrl)
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
// app.use((req,res,next)=>{
//     next(new ExpressError("Page Not Found",404));
// })


//error handling middleware
app.use((err,req,res,next)=>{
    console.log("------ERROR------");
    console.log(err);
    let{status=500,message="An error occurred"}= err;
    console.log(`Status: ${status}, Message: ${message}`);
    res.status(status).render("error.ejs",{err});

})




if (require.main === module) {
    app.listen(8000,()=>{
        console.log("server is running on port 8000");
    });
}
module.exports = app;