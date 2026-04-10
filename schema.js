const Joi= require("joi");
module.exports.listingSchemaData=Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        price:Joi.number().min(0).required(),
        location:Joi.string().required(),
        country:Joi.string().required()
    }).required().unknown(true)
})
