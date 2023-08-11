import { ObjectId, BulkWriteResult } from 'mongodb';
import { FollowerModel } from '@follower/models/follower.schema';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { INotificationDocument } from '@notification/interface/notification.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { socketIoNotificationObject } from '@sockets/notification';
import { notificationTemplate } from '@services/emails/templates/notifications/notification.template';
import { emailQueue } from '@services/queues/email.queue';
import { map } from 'lodash';
import { Config } from '@root/config';
import { mailTransport } from '@services/emails/mail.transporter';
import { UserCache } from '@services/redis/user.cache';

const userCache = new UserCache();

class FollowerService {
    public async addFollowerToDb(userId: string, followeeId: string, username: string, followerDocumentId: ObjectId): Promise<void> {
        const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
        const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);

        const following = await FollowerModel.create({
            _id: followerDocumentId,
            followerId: followerObjectId,
            followeeId: followeeObjectId,
        });

        const user: Promise<BulkWriteResult> = UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: userId },
                    update: { $inc: { followingCount: 1 } }
                }
            },
            {
                updateOne: {
                    filter: { _id: followeeId },
                    update: { $inc: { followersCount: 1 } }
                }
            }
        ]);

        const response: [BulkWriteResult, IUserDocument | null] = await Promise.all([user, userCache.getUserFromCache(followeeId)]);
        // console.log(response);

        if (response[1]?.notifications.follows && userId != followeeId) {
            const notificationModel: INotificationDocument = new NotificationModel();
            const notification = await notificationModel.insertNotification({
                userTo: followeeId,
                userFrom: userId,
                message: `${username} is now following you`,
                comment: '',
                notificationType: 'follows',
                entityId: new mongoose.Types.ObjectId(userId),
                createdItemId: new mongoose.Types.ObjectId(following._id),
                createdAt: new Date(),
                post: '',
                imgId: '',
                imgVersion: '',
                gifUrl: '',
                reaction: ''
            });

            socketIoNotificationObject.emit('insert notification', notification, { userTo: followeeId });

            const template: string = notificationTemplate.template({
                username: response[1].username!,
                message: `${username} has followed you`,
                header: 'Follower Notification'
            });

            if (Config.NODE_ENV === 'development') {
                emailQueue.addEmailJob('followerEmail', { receiverEmail: response[1].email!, subject: 'Sociaza follower notification', template: template });
            }
            else {
                await mailTransport.sendEmail(response[1].email!, 'Sociaza follower notification', template);
            }
        }
    }

    public async removeFollowerFromDb(followeeId: string, followerId: string): Promise<void> {
        const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
        const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

        await FollowerModel.deleteOne({
            followeeId: followeeObjectId,
            followerId: followerObjectId
        });

        await UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: followerObjectId },
                    update: { $inc: { followingCount: -1 } }
                }
            },
            {
                updateOne: {
                    filter: { _id: followeeObjectId },
                    update: { $inc: { followersCount: -1 } }
                }
            }
        ]);
    }

    public async getFollowerData(userObjectId: ObjectId): Promise<IFollowerData[]> {
        // console.log(userObjectId);
        // console.log(await FollowerModel.find({ followerId: userObjectId }));

        return await FollowerModel.aggregate([
            { $match: { followerId: userObjectId } },
            { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
            { $unwind: '$followeeId' },
            { $lookup: { from: 'Auth', localField: 'followeeId.authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            {
                $addFields: {
                    _id: '$followeeId._id',
                    username: '$authId.username',
                    avatarColor: '$authId.avatarColor',
                    postCount: '$followeeId.postsCount',
                    followersCount: '$followeeId.followersCount',
                    followingCount: '$followeeId.followingCount',
                    profilePicture: '$followeeId.profilePicture',
                    userProfile: '$followeeId'
                }
            },
            {
                $project: {
                    authId: 0,
                    followerId: 0,
                    followeeId: 0,
                    createdAt: 0,
                    __v: 0
                }
            }
        ]) as IFollowerData[];
    }

    public async getFolloweeData(userObjectId: ObjectId): Promise<IFollowerData[]> {
        return await FollowerModel.aggregate([
            { $match: { followeeId: userObjectId } },
            { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
            { $unwind: '$followerId' },
            { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            {
                $addFields: {
                    _id: '$followerId._id',
                    username: '$authId.username',
                    avatarColor: '$authId.avatarColor',
                    postCount: '$followerId.postsCount',
                    followersCount: '$followerId.followersCount',
                    followingCount: '$followerId.followingCount',
                    profilePicture: '$followerId.profilePicture',
                    userProfile: '$followerId'
                }
            },
            {
                $project: {
                    authId: 0,
                    followerId: 0,
                    followeeId: 0,
                    createdAt: 0,
                    __v: 0
                }
            }
        ]) as IFollowerData[];
    }

    public async getFollowersId(userId: string): Promise<string[]> {
        const followers = await FollowerModel.aggregate([
            { $match: { followerId: new mongoose.Types.ObjectId(userId) } },
            {
                $project: {
                    followeeId: 1,
                    _id: 0
                }
            }
        ]);

        return map(followers, (result) => {
            return result.followeeId.toString();
        });
    }
}

export const followerService: FollowerService = new FollowerService();