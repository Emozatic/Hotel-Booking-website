const express= require("express");
const app= express();
const mongoose= require("mongoose");
const {Schema}= mongoose;
const path= require("path")
const Listing= require("./models/listing");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError= require("./ExpressError");

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

//wrapAsync for handling async errors
function wrapAsync(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>{next(err)});
    }
}


//index route
app.get("/home",wrapAsync(async(req,res)=>{
    const listings= await Listing.find({});
    console.log(listings);
    res.render("home.ejs",{listings});
}))

//show route
app.get("/home/:id",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    let listing= await Listing.findById(id);
    console.log(listing);
    res.render("show.ejs",{listing});
}))

//create route
app.get("/new",(req,res)=>{
    res.render("new.ejs");
})

app.post("/home",wrapAsync(async(req,res)=>{
    const newListing= new Listing(req.body.listing);
    console.log(req.body.listing);
    await newListing.save().then((result)=>{console.log(result)}).catch((err)=>{console.log(err)}); 
    res.redirect("/home");
}))


//edit route
app.get("/edit/:id",wrapAsync(async(req,res)=>{
    let{id}= req.params;
    let listing= await Listing.findById(id);
    res.render("edit.ejs",{id,listing});
}));

//post edit route
app.put("/edit/:id",wrapAsync(async(req,res)=>{   
    let {id}= req.params;
    let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/home");
}))

//delete route
app.delete("/delete/:id",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/home");
}));

//error handling middleware
app.use((err,req,res,next)=>{
    console.log("------ERROR------");
    console.log(err);
    let{status,message}= err;
    res.status(status).send(message);
})

app.listen(8000,()=>{
    console.log("server is running on port 8000");
})