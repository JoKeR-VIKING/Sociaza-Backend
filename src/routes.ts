import { Application, NextFunction, Request, Response } from 'express';
import { authRoutes } from '@auth/routes/auth.routes';
import { serverAdapter } from '@services/queues/base.queue';
import { currentUserRoutes } from '@auth/routes/currentUser.routes';
import { postRoutes } from '@post/routes/post.routes';
import { reactionRoutes } from '@reaction/routes/reaction.routes'
import { authMiddleware } from '@globals/helpers/authMiddleware';
import { commentRoutes } from '@comment/routes/comment.routes';
import { followerRoutes } from '@follower/routes/follower.routes';
import { notificationRoutes } from '@notification/routes/notification.routes';
import { imageRoutes } from '@image/routes/image.routes';
import { chatRoutes } from '@chat/routes/chat.routes';
import {userRoutes} from "@user/routes/user.routes";

const BASE_PATH = '/api/v1';

export default (app: Application) => {
    const routes = () => {
        app.use('/queues', serverAdapter.getRouter());
        app.use(BASE_PATH, authRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, authRoutes.signoutRoute());

        app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, imageRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, userRoutes.routes());
    };

    routes();
}