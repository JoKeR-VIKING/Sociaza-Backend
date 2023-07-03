import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { IUserDocument } from '@user/interfaces/user.interface';

export interface Followers {
    userId: string;
}

export interface IFollowerDocument extends Document {
    _id: mongoose.Types.ObjectId | string;
    followerId: string;
    followeeId: string;
    createdAt?: Date;
}

export interface IFollower {
    _id: mongoose.Types.ObjectId | string;
    followerId?: string;
    followeeId?: string;
    createdAt?: Date;
}

export interface IFollowerData {
    _id: mongoose.Types.ObjectId | string;
    avatarColor: string;
    followersCount: number;
    followingCount: number;
    profilePicture: string;
    postCount: number;
    username: string;
    uId: string;
    userProfile?: IUserDocument;
}

export interface IFollowerJobData {
    keyOne?: string;
    keyTwo?: string;
    username?: string;
    followerDocumentId?: ObjectId;
}

export interface IBlockedUserJobData {
    keyOne?: string;
    keyTwo?: string;
    type?: string;
}
