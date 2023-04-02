import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/authMiddleware';
import { UpdateNotification } from '@notification/controllers/update.notification';
import { DeleteNotification } from '@notification/controllers/delete.notification';
import { GetNotification } from '@notification/controllers/get.notification';

class NotificationRoutes
{
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/notification', authMiddleware.checkAuthentication, GetNotification.prototype.get);
        this.router.put('/notification/:notificationId', authMiddleware.checkAuthentication, UpdateNotification.prototype.updateNotification);
        this.router.delete('/notification/:notificationId', authMiddleware.checkAuthentication, DeleteNotification.prototype.deleteNotification);

        return this.router;
    }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();