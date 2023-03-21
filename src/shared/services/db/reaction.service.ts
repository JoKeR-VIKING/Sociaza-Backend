import {IQueryReaction, IReactionDocument, IReactionJob} from '@reaction/interfaces/reaction.interface';
import { Helpers } from '@globals/helpers/helpers';
import { ReactionModel } from '@reaction/models/reaction.schema';
import { UserCache } from '@services/redis/user.cache';
import { PostModel } from '@post/models/post.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IPostDocument } from '@post/interfaces/post.interface';
import { omit } from 'lodash';
import mongoose from "mongoose";

const userCache: UserCache = new UserCache();

class ReactionService {
    public async addReactionToDb(reaction: IReactionJob): Promise<void> {
        const { postId, username, previousReactions, userTo, userFrom, type, reactionObject } = reaction;
        let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
        if (previousReactions)
            updatedReactionObject = omit(reactionObject, ['_id']);

        const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = await Promise.all([
            userCache.getUserFromCache(`${userTo}`) as Promise<IUserDocument>,
            ReactionModel.replaceOne(
                { postId: postId, type: previousReactions, username: username },
                updatedReactionObject,
                { upsert: true }
            ) as unknown as Promise<IReactionDocument>,
            PostModel.findOneAndUpdate(
                { _id: postId },
                { $inc: { [`reactions.${previousReactions}`]: -1, [`reactions.${type}`]: 1 } },
                { new: true }
            ) as unknown as Promise<IPostDocument>
        ]);

        // send reaction notification
    }

    public async removeReactionFromDb(reaction: IReactionJob): Promise<void> {
        const { postId, previousReactions, username } = reaction;

        await Promise.all([
            ReactionModel.deleteOne({ postId: postId, type: previousReactions, username }),
            PostModel.updateOne(
                { _id: postId },
                {
                    $inc: { [`reactions.${previousReactions}`]: -1 }
                },
                { new: true }
            )
        ]);
    }

    public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
        const reactions: IReactionDocument[] = await ReactionModel.aggregate([
            { $match: query },
            { $sort: sort },
        ]);

        return [reactions, reactions.length];
    }

    public async getSinglePostReactionsByUsername(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
        const reactions: IReactionDocument[] = await ReactionModel.aggregate([
            { $match: { postId: new mongoose.Types.ObjectId(postId), username: Helpers.firstLetterUppercase(username) } }
        ]);

        return reactions.length ? [reactions[0], 1] : [];
    }

    public async getReactionsByUsername(username: string): Promise<IReactionDocument[]> {
        return ReactionModel.aggregate([
            {$match: {username: Helpers.firstLetterUppercase(username)}}
        ]);
    }
}

export const reactionService: ReactionService = new ReactionService();