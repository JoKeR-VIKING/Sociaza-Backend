import { Request, Response } from 'express';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { ReactionCache } from '@services/redis/reaction.cache';
import { reactionService } from '@services/db/reaction.service';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import {Helpers} from "@globals/helpers/helpers";

const reactionCache: ReactionCache = new ReactionCache();

export class GetReaction {
    public async reactions(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const cachedReactions: [IReactionDocument[], number] = await reactionCache.getReactionFromCache(postId);
        const reactions: [IReactionDocument[], number] = cachedReactions[0].length ? cachedReactions :
            await reactionService.getPostReactions({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({ message: 'Post reactions', reactions: reactions[0], count: reactions[1] });
    }

    public async singleReactionByUsername(req: Request, res: Response): Promise<void> {
        const { postId, username } = req.params;
        const cachedReactions: [IReactionDocument, number] | [] = await reactionCache.getReactionByUsernameFromCache(postId, username);
        const reactions: [IReactionDocument, number] | [] = cachedReactions.length ? cachedReactions :
            await reactionService.getSinglePostReactionsByUsername(postId, username);

        res.status(HTTP_STATUS.OK).json({ message: 'Single post reaction',
            reactions: reactions.length ? reactions[0] : {}, count: reactions.length ? reactions[1] : 0 });
    }

    public async reactionsByUsername(req: Request, res: Response): Promise<void> {
        const { username } = req.params;
        const reactions: IReactionDocument[] = await reactionService.getReactionsByUsername(username);

        res.status(HTTP_STATUS.OK).json({ message: 'All reaction by user', reactions });
    }
}
