import Joi, { ObjectSchema } from 'joi';
import PasswordValidator from 'password-validator';

const passwordSchema: PasswordValidator = new PasswordValidator().has().lowercase(1, 'Password must have atleast 1 lowercase character').
                                                                    has().uppercase(1, 'Password must have atleast 1 uppercase character').
                                                                    has().digits(1, 'Password must have atleast 1 numeric character').
                                                                    has().symbols(1, 'Password must have atleast 1 special character');

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
    password: Joi.string().required().min(8).messages({
        'any.required': 'Password is required',
        'string.empty': 'Password must have atleast 8 characters',
        'string.min': 'Password must have atleast 8 characters',
    }),
    confirmPassword: Joi.any().required().valid(Joi.ref('password')).messages({
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

export { signupSchema, passwordSchema };