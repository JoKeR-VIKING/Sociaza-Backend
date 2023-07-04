import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { notificationQueue } from '@services/queues/notification.queue';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { socketIoNotificationObject } from '@sockets/notification';
import { Config } from '@root/config';
import {notificationService} from "@services/db/notification.service";

export class DeleteNotification {
    public async deleteNotification(req: Request, res: Response): Promise<void> {
        const { notificationId } = req.params;
        socketIoNotificationObject.emit('deleteNotification', notificationId);

        if (Config.NODE_ENV === 'development') {
            await notificationQueue.addNotificationJob('deleteNotification', { key: notificationId });
        }
        else {
            await notificationService.deleteNotification(notificationId);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Notification deleted' });
    }
}