import Joi, { ObjectSchema } from 'joi';
import { JoiPasswordExtend, joiPasswordExtendCore } from 'joi-password';

const JoiPassword: JoiPasswordExtend = Joi.extend(joiPasswordExtendCore);

const signupSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().required().min(5).max(200).messages({
        'any.required': 'Username is a required field',
        'string.empty': 'Username must have atleast 5 characters',
        'string.min': 'Username must have atleast 5 characters',
        'string.max': 'Username must have atmost 200 characters',
    }),
    email: Joi.string().required().email().messages({
        'any.required': 'Email is required',
        'string.empty': 'Email is required',
        'string.email': 'Email must be valid',
    }),
    password: JoiPassword.string().required().min(8).minOfLowercase(1).minOfUppercase(1).minOfNumeric(1).minOfSpecialCharacters(1).messages({
        'any.required': 'Password is required',
        'password.minOfLowercase': 'Password must have atleast 1 lowercase character',
        'password.minOfUppercase': 'Password must have atleast 1 uppercase character',
        'password.minOfNumeric': 'Password must have atleast 1 numeric character',
        'password.minOfSpecialCharacters': 'Password must have atleast 1 special character',
        'string.empty': 'Password must have atleast 8 characters',
        'string.min': 'Password must have atleast 8 characters',
    }),
    confirmPassword: JoiPassword.any().required().valid(JoiPassword.ref('password')).messages({
        'any.required': 'Confirm password is required',
        'string.empty': 'Confirm password is required',
        'any.only': 'Passwords do not match',
    }),
    avatarColor: Joi.string().required().messages({
        'any.required': 'Avatar color is required',
        'string.empty': 'Avatar color cannot be empty',
    }),
    avatarImage: Joi.string().required().messages({
        'any.required': 'Avatar image is required',
        'string.empty': 'Avatar image is required',
    }),
});

export { signupSchema };