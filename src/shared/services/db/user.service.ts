import {
    IBasicInfo,
    INotificationSettings,
    ISearchUser,
    ISocialLinks,
    IUserDocument
} from '@user/interfaces/user.interface';
import { Helpers } from '@globals/helpers/helpers';
import { UserModel } from '@user/models/user.schema';
import { AuthModel } from '@auth/models/auth.schema';
import mongoose from 'mongoose';
import {UserCache} from "@services/redis/user.cache";
import {followerService} from "@services/db/follower.service";
import {indexOf, random} from "lodash";

class UserService {
    public async createUser(data: IUserDocument): Promise<void> {
        await UserModel.create(data);
    }

    public async getUserByAuthId(authId: string): Promise<IUserDocument> {
        const query = {
            authId: authId
        };

        return await UserModel.findOne(query).exec() as IUserDocument;
    }

    public async getUserByUserId(userId: string): Promise<IUserDocument> {
        const users: IUserDocument[] = await UserModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            { $project: this.aggregateProject() }
        ]);

        return users[0] as IUserDocument;
    }

    public async getAllUsers(userId: string, skip: number, limit: number): Promise<IUserDocument[]> {
        const users: IUserDocument[] = await UserModel.aggregate([
            { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
            { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            { $project: this.aggregateProject() }
        ]);

        return users as IUserDocument[];
    }

    public async getRandomUsers(userId: string): Promise<IUserDocument[]> {
        const randomUsers: IUserDocument[] = [];
        const users: IUserDocument[] = await UserModel.aggregate([
            { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
            { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            { $sample: { size: 10 } },
            {
                $addFields: {
                    username: '$authId.username',
                    email: '$authId.email',
                    avatarColor: '$authId.avatarColor',
                    uId: '$authId.uId',
                    createdAt: '$authId.createdAt'
                }
            },
            {
                $project: {
                    authId: 0,
                    __v: 0
                }
            }
        ]);

        const followers: string[] = await followerService.getFollowersId(`${userId}`);

        for (const user of users) {
            const followerIndex = indexOf(followers, user._id.toString());
            if (followerIndex < 0)
                randomUsers.push(user);
        }

        return randomUsers;
    }

    public async searchUsersInDB(regex: RegExp): Promise<ISearchUser[]> {
        return AuthModel.aggregate([
            { $match: { username: regex } },
            { $lookup: { from: 'User', localField: '_id', foreignField: 'authId', as: 'user' } },
            { $unwind: '$user' },
            {
                $project: {
                    _id: '$user._id',
                    username: 1,
                    email: 1,
                    avatarColor: 1,
                    profilePicture: 1
                }
            }
        ]);
    }

    public async updatePassword(email: string, hashedPassword: string): Promise<void> {
        await AuthModel.updateOne({ email: email }, { $set: { password: hashedPassword } }).exec();
    }

    public async updateUserInfo(userId: string, info: IBasicInfo): Promise<void> {
        await UserModel.updateOne({ _id: userId }, {
            $set: {
                work: info.work,
                school: info.school,
                quote: info.quote,
                location: info.location
            }
        }).exec();
    }

    public async updateSocialFields(userId: string, links: ISocialLinks): Promise<void> {
        await UserModel.updateOne({ _id: userId }, { $set: { social: links } });
    }

    public async updateNotificationSettings(userId: string, settings: INotificationSettings): Promise<void> {
        await UserModel.updateOne({ _id: userId }, { $set: { notifications: settings } }).exec();
    }

    public async getTotalUsersInDb(): Promise<number> {
        return UserModel.find({}).countDocuments();
    }

    private aggregateProject() {
        return {
            _id: 1,
            username: '$authId.username',
            uId: '$authId.uId',
            email: '$authId.email',
            avatarColor: '$authId.avatarColor',
            createdAt: '$authId.createdAt',
            postsCount: 1,
            work: 1,
            school: 1,
            quote: 1,
            location: 1,
            blocked: 1,
            blockedBy: 1,
            followersCount: 1,
            followingCount: 1,
            notifications: 1,
            social: 1,
            bgImageVersion: 1,
            bgImageId: 1,
            profilePicture: 1,
        }
    }
}

export const userService: UserService = new UserService();