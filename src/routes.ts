import { Application, NextFunction, Request, Response } from 'express';
import { authRoutes } from '@auth/routes/auth.routes';
import { serverAdapter } from '@services/queues/base.queue';
import { currentUserRoutes } from '@auth/routes/currentUser.routes';
import { postRoutes } from '@post/routes/post.routes';
import { authMiddleware } from '@globals/helpers/authMiddleware';
import JWT from "jsonwebtoken";

const BASE_PATH = '/api/v1';

export default (app: Application) => {
    const routes = () => {
        app.use('/queues', serverAdapter.getRouter());
        app.use(BASE_PATH, authRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, authRoutes.signoutRoute());

        app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    };

    routes();
}