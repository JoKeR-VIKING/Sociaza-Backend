import Joi, { ObjectSchema } from 'joi';

const addReactionSchema: ObjectSchema = Joi.object().keys({
    userTo: Joi.string().required().messages({
        'any.required': 'userTo is required property',
    }),
    postId: Joi.string().required().messages({
        'any.required': 'postId is a required field',
    }),
    type: Joi.string().required().messages({
        'any.required': 'Reaction type is a required property',
    }),
    profilePicture: Joi.string().optional().allow(null, ''),
    previousReaction: Joi.string().optional().allow(null, ''),
    postReaction: Joi.object().optional().allow(null, ''),
});

const removeReactionSchema: ObjectSchema = Joi.object().keys({
    postReaction: Joi.object().optional().allow(null, ''),
});

export { addReactionSchema, removeReactionSchema };