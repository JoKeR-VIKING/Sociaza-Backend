import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@services/redis/follower.cache';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerQueue } from '@services/queues/follower.queue';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { socketIoFollowerObject } from '@sockets/follower';
import {Config} from '@root/config';
import {followerService} from "@services/db/follower.service";

const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class FollowUser {
    public async follow(req: Request, res: Response): Promise<void> {
        const { followerId } = req.params;

        const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
        const followingCount: Promise<void> = followerCache.updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
        await Promise.all([followersCount, followingCount]);

        const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${followerId}`) as Promise<IUserDocument>;
        const cachedFollowing: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser!.userId}`) as Promise<IUserDocument>;
        const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollowee, cachedFollowing]);

        const followerObjectId: ObjectId = new ObjectId();
        const addFolloweeData: IFollowerData = FollowUser.prototype.userData(response[0]);
        // socketIoFollowerObject.emit('add follower', addFolloweeData);

        const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(`follower:${req.currentUser!.userId}`, `${followerId}`);
        const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`followee:${followerId}`, `${req.currentUser!.userId}`);
        await Promise.all([addFolloweeToCache, addFolloweeToCache]);

        if (Config.NODE_ENV === 'development') {
            followerQueue.addFollowerJob('addFollowerToDb', {
                keyOne: `${req.currentUser!.userId}`,
                keyTwo: `${followerId}`,
                username: `${req.currentUser!.username}`,
                followerDocumentId: followerObjectId
            });
        }
        else {
            await followerService.addFollowerToDb(`${req.currentUser!.userId}`, `${followerId}`, `${req.currentUser!.username}`, followerObjectId);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
    }

    private userData(user: IUserDocument): IFollowerData {
        return {
            _id: new mongoose.Types.ObjectId(user._id),
            username: user.username,
            avatarColor: user.avatarColor,
            postCount: user.postsCount,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            profilePicture: user.profilePicture,
            uId: user.uId,
            userProfile: user
        } as IFollowerData;
    }
}
