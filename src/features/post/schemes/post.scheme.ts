import Joi, { ObjectSchema } from 'joi';

const postSchema: ObjectSchema = Joi.object().keys({
    post: Joi.string().optional().allow(null, ''),
    bgColor: Joi.string().optional().allow(null, ''),
    privacy: Joi.string().optional().allow(null, ''),
    feelings: Joi.string().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    profilePicture: Joi.string().optional().allow(null, ''),
    imgVersion: Joi.string().optional().allow(null, ''),
    imgId: Joi.string().optional().allow(null, ''),
    image: Joi.string().optional().allow(null, ''),
});

const postWithImageSchema: ObjectSchema = Joi.object().keys({
    postImage: Joi.string().required().messages({
        'any.required': 'Image is required to create post',
        'string.empty': 'Image is required to create post',
    }),
    post: Joi.string().optional().allow(null, ''),
    bgColor: Joi.string().optional().allow(null, ''),
    privacy: Joi.string().optional().allow(null, ''),
    feelings: Joi.string().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    profilePicture: Joi.string().optional().allow(null, ''),
    imgVersion: Joi.string().optional().allow(null, ''),
    imgId: Joi.string().optional().allow(null, ''),
});

export { postSchema, postWithImageSchema };