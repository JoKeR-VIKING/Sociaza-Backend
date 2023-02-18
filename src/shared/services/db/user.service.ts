import {INotificationSettings, ISocialLinks, IUserDocument} from '@user/interfaces/user.interface';
import { Helpers } from '@globals/helpers/helpers';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';

class UserService {
    public async createUser(data: IUserDocument): Promise<void> {
        await UserModel.create(data);
    }

    public async getUserByAuthId(authId: string): Promise<IUserDocument> {
        const query = {
            _id: authId
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