import Joi, { ObjectSchema } from 'joi';

const signinSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().required().messages({
        'any.required': 'Username is required',
        'string.empty': 'Username is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password is required',
    }),
});

export { signinSchema };