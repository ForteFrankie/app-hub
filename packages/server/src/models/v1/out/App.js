const Joi = require('joi')

const { AppStatuses, AppTypes } = require('../../../enums')

/*const Developer = require('./Developer.js')
const Organisation = require('./Organisation.js')
const Review = require('./Review')*/
const Version = require('./Version')
const Developer = require('./User')
const Image = require('./Image')

// v1 api schema
const def = Joi.object().keys({
    
    appType: Joi
            .string()
            .required()
            .valid(AppTypes),

    created: Joi
            .number(),

    description: Joi
            .string()
            .max(255, 'utf8')
            .required(),

    developer: Developer.required(),

    images: Joi.array().items(Image).required(),

    id: Joi
        .string()
        .guid({ version: 'uuidv4' })
        .required(),
        
    lastUpdated: Joi
                .number(),

    name: Joi
        .string()
        .max(255, 'utf8')
        .required(),

    owner: Joi
            .string()
            .required(),

    reviews: Joi
            .array()
            .items(Joi.any())
            .required(),

    sourceUrl: Joi
                .string()
                .uri()
                .required()
                .allow(''),

    status: Joi
            .string()
            .required()
            .valid(AppStatuses),

    versions: Joi
                .array()
                .items(Version)
                .min(1),   

})

module.exports = {
    def
}
