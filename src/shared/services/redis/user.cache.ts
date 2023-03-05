import { BaseCache } from '@services/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { ServerError } from '@globals/helpers/errorHandler';
import { Helpers } from '@globals/helpers/helpers';

const log: Logger = Config.createLogger('user_cache');

export class UserCache extends BaseCache {
    constructor() {
        super('user_cache');
    }

    public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
        const createdAt = new Date();
        const {
            _id,
            uId,
            username,
            email,
            avatarColor,
            blocked,
            blockedBy,
            postsCount,
            profilePicture,
            followersCount,
            followingCount,
            notifications,
            work,
            location,
            school,
            quote,
            bgImageId,
            bgImageVersion,
            social
        } = createdUser;

        const firstList: string[] = [
            '_id', `${_id}`,
            'uId', `${uId}`,
            'username', `${username}`,
            'email', `${email}`,
            'avatarColor', `${avatarColor}`,
            'postsCount', `${postsCount}`,
        ]

        const secondList: string[] = [
            'blocked', JSON.stringify(blocked),
            'blockedBy', JSON.stringify(blocked),
            'profilePicture', `${profilePicture}`,
            'followersCount', `${followersCount}`,
            'followingCount', `${followingCount}`,
            'notifications', JSON.stringify(notifications),
            'social', JSON.stringify(social)
        ]

        const thirdList: string[] = [
            'work', `${work}`,
            'location', `${location}`,
            'school', `${school}`,
            'quote', `${quote}`,
            'bgImageId', `${bgImageId}`,
            'bgImageVersion', `${bgImageVersion}`,
        ]

        const dataToSave: string[] = [
            ...firstList,
            ...secondList,
            ...thirdList
        ]

        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            await this.client.ZADD('users', {
                score: parseInt(userUId, 10), value: `${key}`
            });

            for (let i=0;i<dataToSave.length;i += 2)
                await this.client.HSET(`users:${key}`, dataToSave[i], dataToSave[i + 1]);
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const userFromCache: IUserDocument = await this.client.HGETALL(`users:${userId}`) as unknown as IUserDocument;
            userFromCache.createdAt = new Date(Helpers.parseJson(`${userFromCache.createdAt}`));
            userFromCache.postsCount = Helpers.parseJson(`${userFromCache.postsCount}`);
            userFromCache.blocked = Helpers.parseJson(`${userFromCache.blocked}`);
            userFromCache.blockedBy = Helpers.parseJson(`${userFromCache.blockedBy}`);
            userFromCache.notifications = Helpers.parseJson(`${userFromCache.notifications}`);
            userFromCache.social = Helpers.parseJson(`${userFromCache.social}`);
            userFromCache.followersCount = Helpers.parseJson(`${userFromCache.followersCount}`);
            userFromCache.followingCount = Helpers.parseJson(`${userFromCache.followingCount}`);

            return userFromCache;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }
}
