import Joi, { ObjectSchema } from 'joi';
import { JoiPasswordExtend, joiPasswordExtendCore } from 'joi-password';

const JoiPassword: JoiPasswordExtend = Joi.extend(joiPasswordExtendCore);

const passwordResetSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().required().email().messages({
        'any.required': 'Email is required',
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
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
        'any.required': 'Confirm password is required',
        'string.empty': 'Confirm password is required',
        'string.only': 'Passwords do not match',
    }),
});

export { passwordResetSchema };