import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@services/redis/follower.cache';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerQueue } from '@services/queues/follower.queue';
import mongoose from 'mongoose';
import {followerService} from "@services/db/follower.service";
import {Config} from "@root/config";

const followerCache: FollowerCache = new FollowerCache();

export class UnfollowUser {
    public async unfollow(req: Request, res: Response): Promise<void> {
        const { followeeId, followerId } = req.params;

        const removeFollowerFromCache: Promise<void> = followerCache.removeFollowerFromCache(`follower:${req.currentUser!.userId}`, followeeId);
        const removeFollowingFromCache: Promise<void> = followerCache.removeFollowerFromCache(`followee:${followeeId}`, followerId);

        const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followeeId}`, 'followersCount', -1);
        const followingCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followingCount', -1);

        await Promise.all([removeFollowerFromCache, removeFollowingFromCache, followersCount, followingCount]);

        if (Config.NODE_ENV === 'development') {
            followerQueue.addFollowerJob('removeFollowerFromDb', {
                keyOne: `${followeeId}`,
                keyTwo: `${req.currentUser!.userId}`
            });
        }
        else {
            await followerService.removeFollowerFromDb(`${followeeId}`, `${req.currentUser!.userId}`);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
    }
}
