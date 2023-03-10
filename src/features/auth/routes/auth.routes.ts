import express, { Router } from 'express';
import { SignUp } from '@auth/controllers/signup';
import { SignIn } from '@auth/controllers/signin';
import { Signout } from '@auth/controllers/signout';
import { authMiddleware } from '@globals/helpers/authMiddleware';
import { Password } from '@auth/controllers/password';

class AuthRoutes {
    private readonly authRouter: Router;
    private readonly signoutRouter: Router;

    constructor () {
        this.authRouter = express.Router();
        this.signoutRouter = express.Router();
    }

    public routes(): Router {
        this.authRouter.post('/signup', SignUp.prototype.create);
        this.authRouter.post('/signin', SignIn.prototype.read);
        this.authRouter.post('/forgot-password', Password.prototype.create);
        this.authRouter.post('/reset-password/:token', Password.prototype.update);

        return this.authRouter;
    }

    public signoutRoute(): Router {
        this.signoutRouter.get('/signout', authMiddleware.checkAuthentication, Signout.prototype.signout);

        return this.signoutRouter;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();