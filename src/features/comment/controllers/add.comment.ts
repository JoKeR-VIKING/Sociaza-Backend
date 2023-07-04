import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { CommentCache } from '@services/redis/comment.cache';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import { addCommentSchema } from '@comment/schemes/comment.scheme';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import { commentQueue } from '@services/queues/comment.queue';
import {commentService} from "@services/db/comment.service";
import { Config } from '@root/config';

const commentCache: CommentCache = new CommentCache();

export class AddComment {
    @joiValidation(addCommentSchema)
    public async add(req: Request, res: Response): Promise<void> {
        const { userTo, postId, comment, profilePicture } = req.body;
        const commentObject: ICommentDocument = {
            _id: new ObjectId(),
            postId: postId,
            username: `${req.currentUser!.username}`,
            avatarColor: `${req.currentUser!.avatarColor}`,
            comment: comment,
            profilePicture: profilePicture,
            createdAt: new Date()
        } as ICommentDocument;

        await commentCache.savePostCommentToCache(postId, JSON.stringify(commentObject));

        const databaseCommentData: ICommentJob = {
            postId: postId,
            userTo: userTo,
            userFrom: req.currentUser!.userId,
            username: req.currentUser!.username,
            comment: commentObject,
        };

        if (Config.NODE_ENV === 'development') {
            commentQueue.addCommentJob('addCommentToDb', databaseCommentData);
        }
        else {
            commentService.addCommentToDb(databaseCommentData);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Comment added successfully.' });
    }
}