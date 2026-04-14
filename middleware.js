module.exports.isloggedIn= (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged In");
        res.redirect("/login");
    }else{
    next();
    }
}