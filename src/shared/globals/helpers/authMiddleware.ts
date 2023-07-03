import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { Config } from '@root/config';
import { NotAuthorizedError } from '@globals/helpers/errorHandler'
import { AuthPayload } from "@auth/interfaces/auth.interface";

import Logger from 'bunyan';

const log: Logger = Config.createLogger('authMiddleware');

export class AuthMiddleware {
    public verifyUser(req: Request, _res: Response, next: NextFunction): void {
        if (!req.session!.jwt) {
            throw new NotAuthorizedError('Session expired. Please login again.');
        }

        try {
            req.currentUser = JWT.verify(req.session!.jwt, Config.JWT_TOKEN!) as AuthPayload;
        }
        catch (err) {
            throw new NotAuthorizedError('Please login again.');
        }

        next();
    }

    public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
        if (!req.currentUser) {
            throw new NotAuthorizedError('Authentication is required to access this route.');
        }

        next();
    }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();