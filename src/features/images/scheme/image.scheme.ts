import Joi, { ObjectSchema } from 'joi';

export const addImageSchema: ObjectSchema = Joi.object().keys({
    image: Joi.string().required()
});
