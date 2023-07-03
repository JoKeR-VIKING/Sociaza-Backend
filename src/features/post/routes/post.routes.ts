import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/authMiddleware';
import { CreatePost } from '@post/controllers/create.post';
import { GetPost } from '@post/controllers/get.post';
import { DeletePost } from '@post/controllers/delete.post';
import { UpdatePost } from '@post/controllers/update.post';

class PostRoutes {
    private readonly postRouter: Router;

    constructor () {
        this.postRouter = express.Router();
    }

    public routes(): Router {
        this.postRouter.get('/post/all/:page', authMiddleware.checkAuthentication, GetPost.prototype.post);
        this.postRouter.get('/post/images/:page', authMiddleware.checkAuthentication, GetPost.prototype.postWithImage);
        this.postRouter.get('/post/videos/:page', authMiddleware.checkAuthentication, GetPost.prototype.postWithVideo);

        this.postRouter.post('/post', authMiddleware.checkAuthentication, CreatePost.prototype.post);
        this.postRouter.post('/post/image-post', authMiddleware.checkAuthentication, CreatePost.prototype.postWithImage);
        this.postRouter.post('/post/video-post', authMiddleware.checkAuthentication, CreatePost.prototype.postWithVideo);

        this.postRouter.put('/post/:postId', authMiddleware.checkAuthentication, UpdatePost.prototype.post);
        this.postRouter.put('/post/image/:postId', authMiddleware.checkAuthentication, UpdatePost.prototype.postWithImage);
        this.postRouter.put('/post/video/:postId', authMiddleware.checkAuthentication, UpdatePost.prototype.postWithVideo);

        this.postRouter.delete('/post/:postId', authMiddleware.checkAuthentication, DeletePost.prototype.post);

        return this.postRouter;
    }
}

export const postRoutes: PostRoutes = new PostRoutes();