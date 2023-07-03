import Joi, { ObjectSchema } from 'joi';
import PasswordValidator from "password-validator";

const basicInfoSchema: ObjectSchema = Joi.object().keys({
    quote: Joi.string().optional().allow(null, ''),
    work: Joi.string().optional().allow(null, ''),
    school: Joi.string().optional().allow(null, ''),
    location: Joi.string().optional().allow(null, ''),
});

const socialLinksSchema: ObjectSchema = Joi.object().keys({
    facebook: Joi.string().optional().allow(null, ''),
    instagram: Joi.string().optional().allow(null, ''),
    twitter: Joi.string().optional().allow(null, ''),
    youtube: Joi.string().optional().allow(null, ''),
});

const passwordSchema: PasswordValidator = new PasswordValidator().has().lowercase(1, 'Password must have atleast 1 lowercase character').
                                                                    has().uppercase(1, 'Password must have atleast 1 uppercase character').
                                                                    has().digits(1, 'Password must have atleast 1 numeric character').
                                                                    has().symbols(1, 'Password must have atleast 1 special character');

const changePasswordSchema: ObjectSchema = Joi.object().keys({
    currentPassword: Joi.string().required().min(8).messages({
        'any.required': 'Password is required',
        'string.empty': 'Password must have atleast 8 characters',
        'string.min': 'Password must have atleast 8 characters',
    }),
    newPassword: Joi.string().required().min(8).messages({
        'any.required': 'Password is required',
        'string.empty': 'Password must have atleast 8 characters',
        'string.min': 'Password must have atleast 8 characters',
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
        'any.required': 'Confirm password is required',
        'string.empty': 'Confirm password is required',
        'string.only': 'Passwords do not match',
    }),
});

const notificationsSettingsSchema: ObjectSchema = Joi.object().keys({
    messages: Joi.boolean().optional(),
    reactions: Joi.boolean().optional(),
    comments: Joi.boolean().optional(),
    follows: Joi.boolean().optional(),
});

export { basicInfoSchema, socialLinksSchema, passwordSchema, changePasswordSchema, notificationsSettingsSchema };