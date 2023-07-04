import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { ServerError } from '@globals/helpers/errorHandler';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { Helpers } from '@globals/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands'
import { find } from 'lodash';

const log: Logger = Config.createLogger('commentCache');

export class CommentCache extends BaseCache {
    constructor() {
        super('commentCache');
    }

    public async savePostCommentToCache(postId: string, value: string): Promise<void> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            await this.client.LPUSH(`comment:${postId}`, value);

            const commentsCount: string[] = await this.client.HMGET(`post:${postId}`, 'commentsCount');
            const count = Helpers.parseJson(commentsCount[0]) as number + 1;

            await this.client.HSET(`post:${postId}`, 'commentsCount', `${count}`);
            await this.client.disconnect();
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getPostCommentFromCache(postId: string): Promise<ICommentDocument[]> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            const replies: string[] = await this.client.LRANGE(`comment:${postId}`, 0, -1);
            const comments: ICommentDocument[] = [];

            for (const reply of replies) {
                comments.push(Helpers.parseJson(reply));
            }

            await this.client.disconnect();
            return comments;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getCommentNamesFromCache(postId: string): Promise<ICommentNameList[]> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            const comments: string[] = await this.client.LRANGE(`comment:${postId}`, 0, -1);
            const commentsCount: number = await this.client.LLEN(`comment:${postId}`);
            const names: string[] = [];

            for (let comment of comments) {
                names.push(Helpers.parseJson(comment).username);
            }

            await this.client.disconnect();
            return [{
                count: commentsCount,
                names: names
            }] as ICommentNameList[];
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getSingleCommentFromCache(postId: string, commentId: string): Promise<ICommentDocument[]> {
        try {
            if (!this.client.isOpen)
                this.client.connect();

            const comments: string[] = await this.client.LRANGE(`comment:${postId}`, 0, -1);

            for (const comment of comments) {
                if (Helpers.parseJson(comment)._id == commentId)
                    return [Helpers.parseJson(comment) as ICommentDocument];
            }

            await this.client.disconnect();
            return [];
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }
}