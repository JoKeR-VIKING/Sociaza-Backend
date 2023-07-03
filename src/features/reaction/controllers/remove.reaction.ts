import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ReactionCache } from '@services/redis/reaction.cache';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { reactionQueue } from '@services/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();

export class RemoveReaction {
    public async remove(req: Request, res: Response): Promise<void> {
        const { postId, previousReaction } = req.params;
        const { postReaction } = req.body;
        await reactionCache.removePostReactionFromCache(postId, `${req.currentUser!.username}`, postReaction);

        const databaseReactionData: IReactionJob = {
            postId: postId,
            username: req.currentUser!.username,
            previousReactions: previousReaction
        };

        reactionQueue.addReactionJob('removeReactionFromDb', databaseReactionData);

        res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed successfully.' });
    }
}
