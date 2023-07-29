import { BaseCache } from '@services/redis/base.cache';
import { INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { ServerError } from '@globals/helpers/errorHandler';
import { Helpers } from '@globals/helpers/helpers';
import {RedisCommandRawReply} from "@redis/client/dist/lib/commands";
import {findIndex, indexOf} from "lodash";

const log: Logger = Config.createLogger('user_cache');
type UserItem = string | ISocialLinks | INotificationSettings;
export type UserCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IUserDocument | IUserDocument[];

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
            userFromCache.bgImageId = Helpers.parseJson(`${userFromCache.bgImageId}`);
            userFromCache.bgImageVersion = Helpers.parseJson(`${userFromCache.bgImageVersion}`);
            userFromCache.profilePicture = Helpers.parseJson(`${userFromCache.profilePicture}`);

            return userFromCache;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getUsersFromCache(start: number, end: number, excludedUserKey: string): Promise<IUserDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const reply: string[] = await this.client.ZRANGE('user', start, end, { REV: true });
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();

            for (const value of reply) {
                if (value === excludedUserKey)
                    continue;

                multi.HGETALL(`users:${value}`);
            }

            const replies: UserCacheMultiType = await multi.exec() as UserCacheMultiType;
            const userReplied: IUserDocument[] = [];

            for (const user of replies as IUserDocument[]) {
                user.createdAt = new Date(Helpers.parseJson(`${user.createdAt}`));
                user.postsCount = Helpers.parseJson(`${user.postsCount}`);
                user.blocked = Helpers.parseJson(`${user.blocked}`);
                user.notifications = Helpers.parseJson(`${user.notifications}`);
                user.social = Helpers.parseJson(`${user.social}`);
                user.followersCount = Helpers.parseJson(`${user.followersCount}`);
                user.followingCount = Helpers.parseJson(`${user.followingCount}`);
                user.bgImageId = Helpers.parseJson(`${user.bgImageId}`);
                user.bgImageVersion = Helpers.parseJson(`${user.bgImageVersion}`);
                user.profilePicture = Helpers.parseJson(`${user.profilePicture}`);

                userReplied.push(user);
            }

            return userReplied;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getRandomUsersFromCache(userId: string, excludedUsername: string): Promise<IUserDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const replies: IUserDocument[] = [];
            const followers: string[] = await this.client.LRANGE(`follower:${userId}`, 0, -1);
            const users: string[] = await this.client.ZRANGE('users', 0, -1);

            const randomUsers: string[] = Helpers.shuffle(users).slice(0, 10);

            for (const key of randomUsers) {
                const followerIndex = indexOf(followers, key);
                if (followerIndex < 0)
                    replies.push(await this.client.HGETALL(`users:${key}`) as unknown as IUserDocument);
            }

            const excludedUsernameIndex: number = findIndex(replies, ['username', excludedUsername]);
            replies.splice(excludedUsernameIndex, 1);

            // console.log(replies);

            for (const user of replies as IUserDocument[]) {
                user.createdAt = new Date(Helpers.parseJson(`${user.createdAt}`));
                user.postsCount = Helpers.parseJson(`${user.postsCount}`);
                user.blocked = Helpers.parseJson(`${user.blocked}`);
                user.notifications = Helpers.parseJson(`${user.notifications}`);
                user.social = Helpers.parseJson(`${user.social}`);
                user.followersCount = Helpers.parseJson(`${user.followersCount}`);
                user.followingCount = Helpers.parseJson(`${user.followingCount}`);
                user.bgImageId = Helpers.parseJson(`${user.bgImageId}`);
                user.bgImageVersion = Helpers.parseJson(`${user.bgImageVersion}`);
                user.profilePicture = Helpers.parseJson(`${user.profilePicture}`);
            }

            return replies;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async updateSingleUserItemInCache(userId: string, props: string, value: UserItem): Promise<IUserDocument | null> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            await this.client.HSET(`users:${userId}`, `${props}`, JSON.stringify(value));
            return await this.getUserFromCache(userId) as IUserDocument;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again');
        }
    }

    public async getTotalUsersInCache(): Promise<number> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            return await this.client.ZCARD('user');
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again');
        }
    }
}
