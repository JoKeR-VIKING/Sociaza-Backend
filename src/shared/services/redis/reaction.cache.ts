import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { ServerError } from '@globals/helpers/errorHandler';
import { IReactionDocument, IReactions } from '@reaction/interfaces/reaction.interface';
import { Helpers } from '@globals/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands'
import { find } from 'lodash';

const log: Logger = Config.createLogger('reactionCache');

export class ReactionCache extends BaseCache {
    constructor() {
        super('reactionCache');
    }

    public async savePostReactionToCache(key: string, reaction: IReactionDocument, postReactions: IReactions, type: string, previousReactions: IReactions): Promise<void> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            if (previousReactions) {
                await this.removePostReactionFromCache(key, reaction.username, postReactions);
            }

            if (type) {
                await this.client.LPUSH(`reaction:${key}`, JSON.stringify(reaction));
                await this.client.HSET(`post:${key}`, 'reactions', JSON.stringify(postReactions));
            }
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async removePostReactionFromCache(key: string, username: string, postReactions: IReactions): Promise<void> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const response: string[] = await this.client.LRANGE(`reaction:${key}`, 0, -1);
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            const userPreviousReaction: IReactionDocument = this.getPreviousReaction(response, username) as IReactionDocument;

            multi.LREM(`reaction:${key}`, 1, JSON.stringify(userPreviousReaction));
            await multi.exec();

            const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)]
            await this.client.HSET(`post:${key}`, dataToSave);
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getReactionFromCache(postId: string): Promise<[IReactionDocument[], number]> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const reactionCount: number = await this.client.LLEN(`reactions:${postId}`);
            const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
            const list: IReactionDocument[] = [];

            for (const item of response) {
                list.push(Helpers.parseJson(item));
            }

            return response.length ? [list, reactionCount] : [[], 0];
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getReactionByUsernameFromCache(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
            const list: IReactionDocument[] = [];

            for (const item of response) {
                list.push(Helpers.parseJson(item));
            }

            const result: IReactionDocument = find(list, (listItem: IReactionDocument) => {
                return listItem.postId === postId && listItem.username === username;
            }) as IReactionDocument;

            return result ? [result, 1] : [];
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server error. Try again.');
        }
    }

    private getPreviousReaction(response: string[], username: string): IReactionDocument | undefined {
        const list: IReactionDocument[] = [];
        for (const item of response) {
            list.push(Helpers.parseJson(item) as IReactionDocument);
        }

        // console.log(list);

        return find(list, (listItem: IReactionDocument) => {
            return listItem.username === username;
        });
    }
}