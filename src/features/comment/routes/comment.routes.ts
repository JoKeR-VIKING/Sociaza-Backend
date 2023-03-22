import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/authMiddleware';
import { AddComment } from '@comment/controllers/add.comment';
import { GetComment } from '@comment/controllers/get.comment';

class CommentRoutes {
    private readonly commentRouter: Router;

    constructor () {
        this.commentRouter = express.Router();
    }

    public routes(): Router {
        this.commentRouter.get('/post/comment/:postId', authMiddleware.checkAuthentication, GetComment.prototype.allPostComments);
        this.commentRouter.get('/post/comment/names/:postId', authMiddleware.checkAuthentication, GetComment.prototype.allPostCommentNames);
        this.commentRouter.get('/post/comment/:postId/:commentId', authMiddleware.checkAuthentication, GetComment.prototype.singleComment);

        this.commentRouter.post('/post/comment', authMiddleware.checkAuthentication, AddComment.prototype.add);

        return this.commentRouter;
    }
}

export const commentRoutes: CommentRoutes = new CommentRoutes();