import mongoose, { model, Model, Schema } from 'mongoose';
import { IFollowerDocument } from '@follower/interfaces/follower.interface';

const followerSchema: Schema = new Schema({
    followerId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    followeeId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    createdAt: { type: Date, default: Date.now() }
});

export const FollowerModel: Model<IFollowerDocument> = model<IFollowerDocument>('Follower', followerSchema, 'Follower');
