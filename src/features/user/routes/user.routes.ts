import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/authMiddleware';
import {GetUserProfile} from "@user/controllers/get.user.profile";
import {SearchUsers} from "@user/controllers/search.users";
import {ChangePassword} from "@user/controllers/change.password";
import {UpdateBasicInfo} from "@user/controllers/update.basic.info";

class UserRoutes {
    private readonly userRouter: Router;

    constructor () {
        this.userRouter = express.Router();
    }

    public routes(): Router {
        this.userRouter.put('/user/profile/change-password', authMiddleware.checkAuthentication, ChangePassword.prototype.passwordUpdate);

        this.userRouter.put('/user/profile/update/info', authMiddleware.checkAuthentication, UpdateBasicInfo.prototype.updateUserInfo);
        this.userRouter.put('/user/profile/update/social', authMiddleware.checkAuthentication, UpdateBasicInfo.prototype.updateUserSocial);
        this.userRouter.put('/user/profile/update/notification', authMiddleware.checkAuthentication, UpdateBasicInfo.prototype.updateNotifiationSettings);

        this.userRouter.get('/user/all/:page', authMiddleware.checkAuthentication, GetUserProfile.prototype.all);
        this.userRouter.get('/user/profile/search/:query', authMiddleware.checkAuthentication, SearchUsers.prototype.search);
        this.userRouter.get('/user/profile/suggestions', authMiddleware.checkAuthentication, GetUserProfile.prototype.randomUserSuggestions);
        this.userRouter.get('/user/profile', authMiddleware.checkAuthentication, GetUserProfile.prototype.profile);
        this.userRouter.get('/user/profile/id/:userId', authMiddleware.checkAuthentication, GetUserProfile.prototype.profileById);
        this.userRouter.get('/user/profile/posts/:username/:userId/:uId', authMiddleware.checkAuthentication, GetUserProfile.prototype.profileAndPosts);

        return this.userRouter;
    }
}

export const userRoutes: UserRoutes = new UserRoutes();