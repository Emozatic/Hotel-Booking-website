const mongoose= require("mongoose");
const {Schema}= mongoose;
const passportLocalMongoose= require("passport-local-mongoose").default;
console.log(passportLocalMongoose);
const userSchema= new Schema({
    email:{
        type:String,
        required:true,
    },
});

userSchema.plugin(passportLocalMongoose); //adding username and password field to user schema and also some methods for authentication like salting and hashing password

const User= mongoose.model("User", userSchema);
module.exports= User;