const cloudinary= require("cloudinary").v2;
//console.log(cloudinary);
const {CloudinaryStorage}= require("multer-storage-cloudinary");
console.log(CloudinaryStorage);


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage= new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"test",
        allowedFormats:["jpeg","png","jpg"]
    }
})

module.exports={
    cloudinary, storage
}