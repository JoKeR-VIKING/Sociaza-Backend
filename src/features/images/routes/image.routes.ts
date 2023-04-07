import express, { Router } from 'express';
import { AddImage } from '@image/controllers/add.image';
import { DeleteImage } from '@image/controllers/delete.image';
import { GetImage } from '@image/controllers/get.image';
import { authMiddleware } from '@globals/helpers/authMiddleware';

class ImageRoutes {
    private readonly router: Router;

    constructor () {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/images/:userId', authMiddleware.checkAuthentication, GetImage.prototype.images);
        this.router.post('/images/profile', authMiddleware.checkAuthentication, AddImage.prototype.addProfileImage);
        this.router.post('/images/background', authMiddleware.checkAuthentication, AddImage.prototype.addBackgroundImage);
        this.router.delete('/images/:imageId', authMiddleware.checkAuthentication, DeleteImage.prototype.deleteImage);
        this.router.delete('/images/background/:bgImageId', authMiddleware.checkAuthentication, DeleteImage.prototype.deleteBackgroundImage);

        return this.router;
    }
}

export const imageRoutes: ImageRoutes = new ImageRoutes();