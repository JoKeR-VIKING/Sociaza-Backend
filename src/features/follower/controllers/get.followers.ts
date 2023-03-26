import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@services/redis/follower.cache';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFollowerData, IFollower } from '@follower/interfaces/follower.interface';
import { followerQueue } from '@services/queues/follower.queue';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { socketIoFollowerObject } from '@sockets/follower';
import { followerService } from '@services/db/follower.service';

const followerCache: FollowerCache = new FollowerCache();

export class GetFollowers {
    public async getFollowing(req: Request, res: Response): Promise<void> {
        const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
        const cachedFollowees: IFollowerData[] = await followerCache.getFollowersFromCache(`followee:${req.currentUser!.userId}`);
        const followee: IFollowerData[] = cachedFollowees.length ? cachedFollowees : await followerService.getFollowerData(userObjectId);

        res.status(HTTP_STATUS.OK).json({ message: 'Followees for user', followee });
    }

    public async getFollowers(req: Request, res: Response): Promise<void> {
        const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params.userId);
        const cachedFollowers: IFollowerData[] = await followerCache.getFollowersFromCache(`follower:${req.params.userId}`);
        const followers: IFollowerData[] = cachedFollowers.length ? cachedFollowers : await followerService.getFolloweeData(userObjectId);

        res.status(HTTP_STATUS.OK).json({ message: 'Followers for user', followers });
    }
}
