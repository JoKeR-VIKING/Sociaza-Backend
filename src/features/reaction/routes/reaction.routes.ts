import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/authMiddleware';
import { AddReaction } from '@reaction/controllers/add.reaction';
import { RemoveReaction } from '@reaction/controllers/remove.reaction';
import { GetReaction } from "@reaction/controllers/get.reaction";

class ReactionRoutes
{
    private readonly reactionRouter: Router;

    constructor () {
        this.reactionRouter = express.Router();
    }

    public routes(): Router {
        this.reactionRouter.get('/reaction/post/:postId', authMiddleware.checkAuthentication, GetReaction.prototype.reactions);
        this.reactionRouter.get('/reaction/username/:username', authMiddleware.checkAuthentication, GetReaction.prototype.reactionsByUsername);
        this.reactionRouter.get('/reaction/:postId/:username', authMiddleware.checkAuthentication, GetReaction.prototype.singleReactionByUsername);

        this.reactionRouter.post('/reaction', authMiddleware.checkAuthentication, AddReaction.prototype.add);
        this.reactionRouter.delete('/reaction/:postId/:previousReaction', authMiddleware.checkAuthentication, RemoveReaction.prototype.remove);

        return this.reactionRouter;
    }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();