import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { notificationQueue } from '@services/queues/notification.queue';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { socketIoNotificationObject } from '@sockets/notification';

export class UpdateNotification {
    public async updateNotification(req: Request, res: Response): Promise<void> {
        const { notificationId } = req.params;
        socketIoNotificationObject.emit('updateNotification', notificationId);
        await notificationQueue.addNotificationJob('updateNotification', { key: notificationId });
        res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' });
    }
}
