import mongoose, { model, Model, Schema } from 'mongoose';
import { IFileImageDocument } from '@root/features/images/interfaces/image.interface';

const imageSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    bgImageVersion: { type: String, default: '' },
    bgImageId: { type: String, default: '' },
    imgId: { type: String, default: '' },
    createadAt: { type: Date, default: Date.now, index: true },
});

export const ImageModel: Model<IFileImageDocument> = model<IFileImageDocument>('Image', imageSchema, 'Image' );