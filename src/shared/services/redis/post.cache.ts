// noinspection ExceptionCaughtLocallyJS

import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { Config } from '@root/config';
import {BadRequestError, ServerError} from '@globals/helpers/errorHandler';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { IReactions } from '@reaction/interfaces/reaction.interface';
import { Helpers } from '@globals/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands'

const log: Logger = Config.createLogger('postCache');

export type PostCacheMultiType = string | number | RedisCommandRawReply[] | IPostDocument | IPostDocument[];

export class PostCache extends BaseCache {
    constructor() {
        super('postCache');
    }

    public async savePostToCache(data: ISavePostToCache): Promise<void> {
        const { key, currentUserId, uId, createdPost } = data;
        const {
            _id,
            userId,
            username,
            email,
            avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount,
            imgVersion,
            imgId,
            videoVersion,
            videoId,
            reactions,
            createdAt
        } = createdPost;

        const firstList: string[] = [
            'id',
            `${_id}`,
            'userId',
            `${userId}`,
            'username',
            `${username}`,
            'email',
            `${email}`,
            'avatarColor',
            `${avatarColor}`,
            'profilePicture',
            `${profilePicture}`,
            'post',
            `${post}`,
            'bgColor',
            `${bgColor}`,
            'feelings',
            `${feelings}`,
            'privacy',
            `${privacy}`,
            'gifUrl',
            `${gifUrl}`
        ];

        const secondList: string[] = [
            'commentsCount',
            `${commentsCount}`,
            'reactions',
            JSON.stringify(reactions),
            'imgVersion',
            `${imgVersion}`,
            'imgId',
            `${imgId}`,
            'videoVersion',
            `${videoVersion}`,
            'videoId',
            `${videoId}`,
            'createdAt',
            `${createdAt}`
        ];

        const dataToSave: string[] = [...firstList, ...secondList];

        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });

            for (let i=0;i<dataToSave.length;i += 2)
                multi.HSET(`post:${key}`, dataToSave[i], dataToSave[i + 1]);

            const count: number = parseInt(postCount[0], 10) + 1;
            multi.HSET(`users:${currentUserId}`, 'postsCount', count);
            multi.exec();
            await this.client.disconnect();
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();

            for (const value of reply) {
                multi.HGETALL(`post:${value}`);
            }

            const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
            const posts: IPostDocument[] = [];

            for (const post of replies as IPostDocument[]) {
                post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
                post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
                post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;

                posts.push(post);
            }

            await this.client.disconnect();
            return posts;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getPostsWithImageFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();

            for (const value of reply) {
                multi.HGETALL(`post:${value}`);
            }

            const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
            const postsWithImage: IPostDocument[] = [];

            for (const post of replies as IPostDocument[]) {
                if (!post.imgId || !post.imgVersion || post.gifUrl)
                    continue;

                post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
                post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
                post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;

                postsWithImage.push(post);
            }

            await this.client.disconnect();
            return postsWithImage;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getPostsWithVideoFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();

            for (const value of reply) {
                multi.HGETALL(`post:${value}`);
            }

            const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
            const postsWithVideo: IPostDocument[] = [];

            for (const post of replies as IPostDocument[]) {
                if (!post.videoId || !post.videoVersion || post.gifUrl)
                    continue;

                post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
                post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
                post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;

                postsWithVideo.push(post);
            }

            await this.client.disconnect();
            return postsWithVideo;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getUserPostsFromCache(key: string, uId: number) {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const reply: string[] = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();

            for (const value of reply) {
                multi.HGETALL(`post:${value}`);
            }

            const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
            const userPosts: IPostDocument[] = [];

            for (const post of replies as IPostDocument[]) {
                post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
                post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
                post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;

                userPosts.push(post);
            }

            await this.client.disconnect();
            return userPosts;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getTotalPostsFromCache(): Promise<number> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            await this.client.disconnect();
            return await this.client.ZCARD('post');
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again');
        }
    }

    public async getTotalUserPostsFromCache(uId: number): Promise<number> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            await this.client.disconnect();
            return await this.client.ZCOUNT('post', uId, uId);
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again');
        }
    }

    public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const post = await this.client.HGETALL(`post:${key}`);
            if (!post.id)
                throw new BadRequestError('No such post exists!');

            const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();

            multi.ZREM('post', `${key}`);
            multi.DEL(`post:${key}`);
            multi.DEL(`comment:${key}`);
            multi.DEL(`reaction:${key}`);

            const count: number = parseInt(postCount[0], 10) - 1;
            multi.HSET(`users:${currentUserId}`, 'postsCount', count);

            await multi.exec();
            await this.client.disconnect();
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.')
        }
    }

    public async updatePostInCache(key: string, updatedPost: IPostDocument): Promise<IPostDocument> {
        const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, videoVersion, videoId, profilePicture } = updatedPost;
        const firstList: string[] = [
            'post',
            `${post}`,
            'bgColor',
            `${bgColor}`,
            'feelings',
            `${feelings}`,
            'privacy',
            `${privacy}`,
            'gifUrl',
            `${gifUrl}`,
            'videoVersion',
            `${videoVersion}`,
            'videoId',
            `${videoId}`
        ];

        const secondList: string[] = ['profilePicture', `${profilePicture}`, `imgVersion`, `${imgVersion}`, 'imgId', `${imgId}`];
        const dataToSave = [...firstList, ...secondList];

        try {
            if (!this.client.isOpen)
                await this.client.connect();

            for (let i=0;i<dataToSave.length;i+=2)
                await this.client.HSET(`post:${key}`, dataToSave[i], dataToSave[i + 1]);

            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            multi.HGETALL(`post:${key}`);
            
            const reply: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
            const postReply = reply as IPostDocument[];

            postReply[0].commentsCount = Helpers.parseJson(`${postReply[0].commentsCount}`) as number;
            postReply[0].reactions = Helpers.parseJson(`${postReply[0].reactions}`) as IReactions;
            postReply[0].createdAt = Helpers.parseJson(`${postReply[0].createdAt}`) as Date;

            await this.client.disconnect();
            return postReply[0];
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.')
        }
    }
}
