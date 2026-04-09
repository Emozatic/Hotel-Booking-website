const express= require("express");
const app= express();
const mongoose= require("mongoose");
const {Schema}= mongoose;
const path= require("path")
const Listing= require("./models/listing");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");

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



//index route
app.get("/home", async(req,res)=>{
    const listings= await Listing.find({});
    console.log(listings);
    res.render("home.ejs",{listings});
})

//show route
app.get("/home/:id",async(req,res)=>{
    let {id}= req.params;
    let listing= await Listing.findById(id);
    console.log(listing);
    res.render("show.ejs",{listing});
})

//create route
app.get("/new",(req,res)=>{
    res.render("new.ejs");
})

app.post("/home",async(req,res)=>{
    const newListing= new Listing(req.body.listing);
    console.log(req.body.listing);
    await newListing.save().then((result)=>{console.log(result)}).catch((err)=>{console.log(err)}); 
    res.redirect("/home");
})


//edit route
app.get("/edit/:id",async(req,res)=>{
    let{id}= req.params;
    res.render("edit.ejs",{id});
})

//post edit route
app.put("/edit/:id",async(req,res)=>{   
    let {id}= req.params;
    let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/home");
})

//delete route
app.delete("/delete/:id",async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/home");
});

app.listen(8000,()=>{
    console.log("server is running on port 8000");
})