import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { ReactionCache } from '@services/redis/reaction.cache';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import { addReactionSchema } from '@reaction/schemes/reaction.scheme';
import { IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { reactionQueue } from '@services/queues/reaction.queue';
import {Config} from "@root/config";
import {reactionService} from "@services/db/reaction.service";

const reactionCache: ReactionCache = new ReactionCache();

export class AddReaction {
    @joiValidation(addReactionSchema)
    public async add(req: Request, res: Response): Promise<void> {
        const { userTo, postId, type, profilePicture, previousReaction, postReaction } = req.body;
        const reactionObject: IReactionDocument = {
            _id: new ObjectId(),
            postId: postId,
            type: type,
            profilePicture: profilePicture,
            avatarColor: req.currentUser!.avatarColor,
            username: req.currentUser!.username
        } as IReactionDocument;

        await reactionCache.savePostReactionToCache(postId, reactionObject, postReaction, type, previousReaction);

        const databaseReactionData: IReactionJob = {
            postId: postId,
            userTo: userTo,
            userFrom: req.currentUser!.userId,
            username: req.currentUser!.username,
            type: type,
            previousReactions: previousReaction,
            reactionObject: reactionObject
        };

        if (Config.NODE_ENV === 'development') {
            reactionQueue.addReactionJob('addReactionToDb', databaseReactionData);
        }
        else {
            await reactionService.addReactionToDb(databaseReactionData);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully.' });
    }
}