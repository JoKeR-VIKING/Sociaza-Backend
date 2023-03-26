import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@services/redis/follower.cache';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { blockUserQueue } from '@services/queues/block.queue';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { socketIoFollowerObject } from '@sockets/follower';

const followerCache: FollowerCache = new FollowerCache();

export class BlockUser {
    public async block(req: Request, res: Response): Promise<void> {
        const { followerId } = req.params;
        await BlockUser.prototype.updateBlockUser(followerId, req.currentUser!.userId, 'block');
        await blockUserQueue.addBlockUserJob('changeBlockStatusInDb', {
            keyOne: `${req.currentUser!.userId}`,
            keyTwo: `${followerId}`,
            type: 'block'
        });

        res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
    }

    public async unblock(req: Request, res: Response): Promise<void> {
        const { followerId } = req.params;
        await BlockUser.prototype.updateBlockUser(followerId, req.currentUser!.userId, 'unblock');
        await blockUserQueue.addBlockUserJob('changeBlockStatusInDb', {
            keyOne: `${req.currentUser!.userId}`,
            keyTwo: `${followerId}`,
            type: 'unblock'
        });

        res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
    }

    private async updateBlockUser(followerId: string, userId: string, type: 'block' | 'unblock'): Promise<void> {
        const blockedBy: Promise<void> = followerCache.updateBlockStatus(`${followerId}`, 'blockedBy', `${userId}`, type);
        const blocked: Promise<void> = followerCache.updateBlockStatus(`${userId}`, 'blocked', `${followerId}`, type);

        await Promise.all([blockedBy, blockedBy]);
    }
}
