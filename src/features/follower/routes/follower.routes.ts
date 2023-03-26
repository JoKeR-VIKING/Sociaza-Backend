import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/authMiddleware';
import { FollowUser } from '@follower/controllers/follow.user';
import { UnfollowUser } from '@follower/controllers/unfollow.user';
import { GetFollowers } from '@follower/controllers/get.followers';
import { BlockUser } from '@follower/controllers/block.user';

class FollowerRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, FollowUser.prototype.follow);
        this.router.put('/user/unfollow/:followeeId/:followerId', authMiddleware.checkAuthentication, UnfollowUser.prototype.unfollow);

        this.router.get('/user/following', authMiddleware.checkAuthentication, GetFollowers.prototype.getFollowing);
        this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, GetFollowers.prototype.getFollowers);

        this.router.put('/user/block/:followerId', authMiddleware.checkAuthentication, BlockUser.prototype.block);
        this.router.put('/user/unblock/:followerId', authMiddleware.checkAuthentication, BlockUser.prototype.unblock);

        return this.router;
    }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();