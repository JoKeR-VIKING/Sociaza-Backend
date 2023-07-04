import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { ServerError } from '@globals/helpers/errorHandler';
import { IFollowerDocument, IFollowerData } from '@follower/interfaces/follower.interface';
import { Helpers } from '@globals/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose from 'mongoose';
import { remove } from 'lodash';

const log: Logger = Config.createLogger('followerCache');
const userCache: UserCache = new UserCache();

export class FollowerCache extends BaseCache {
    constructor() {
        super('followerCache');
    }

    public async saveFollowerToCache(key: string, value: string): Promise<void> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            await this.client.LPUSH(key, value);
            await this.client.disconnect();
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async removeFollowerFromCache(key: string, value: string): Promise<void> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            await this.client.LREM(key, 1, value);
            await this.client.disconnect();
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.')
        }
    }

    public async updateFollowersCountInCache(userId: string, prop: string, value: number): Promise<void> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            await this.client.HINCRBY(`users:${userId}`, prop, value);
            await this.client.disconnect();
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.')
        }
    }

    public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const response: string[] = await this.client.LRANGE(key, 0, -1);
            const reply: IFollowerData[] = [];

            for (const userId of response) {
                const user: IUserDocument = await userCache.getUserFromCache(userId) as IUserDocument;
                const data: IFollowerData = {
                    _id: new mongoose.Types.ObjectId(user._id),
                    username: user.username!,
                    avatarColor: user.avatarColor!,
                    postCount: user.postsCount,
                    followersCount: user.followersCount,
                    followingCount: user.followingCount,
                    profilePicture: user.profilePicture,
                    uId: user.uId!,
                    userProfile: user
                }

                reply.push(data);
            }

            await this.client.disconnect();
            return reply;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.')
        }
    }

    public async updateBlockStatus(key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            const response: string = await this.client.HGET(`users:${key}`, prop) as string;
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            let blocked: string[] = Helpers.parseJson(response) as string[];

            if (type === 'block')
                blocked = [...blocked, value];
            else
            {
                remove(blocked, (id: string) => id === value);
                blocked = [...blocked];
            }

            multi.HSET(`users:${key}`, `${prop}`, JSON.stringify(blocked));
            await multi.exec();
            await this.client.disconnect();
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.')
        }
    }
}