import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { CommentCache } from '@services/redis/comment.cache';
import {ICommentDocument, ICommentNameList} from '@comment/interfaces/comment.interface';
import { commentService } from '@services/db/comment.service';
import mongoose from 'mongoose';

const commentCache: CommentCache = new CommentCache();

export class GetComment {
    public async allPostComments(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;

        const cachedComment: ICommentDocument[] = await commentCache.getPostCommentFromCache(postId);
        const comments: ICommentDocument[] = cachedComment.length > 0 ? cachedComment :
            await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({ message: 'All post comments', comments: comments }) ;
    }

    public async allPostCommentNames(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;

        const cachedComment: ICommentNameList[] = await commentCache.getCommentNamesFromCache(postId);
        const comments: ICommentNameList[] = cachedComment.length > 0 ? cachedComment :
            await commentService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({ message: 'All post comment names', comments: comments }) ;
    }

    public async singleComment(req: Request, res: Response): Promise<void> {
        const { postId, commentId } = req.params;

        const cachedComment: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
        const comments: ICommentDocument[] = cachedComment.length > 0 ? cachedComment :
            await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({ message: 'Single post comment', comments: comments }) ;
    }
}