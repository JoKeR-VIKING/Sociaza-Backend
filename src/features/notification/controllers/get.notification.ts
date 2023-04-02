import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { notificationService } from '@services/db/notification.service';
import { INotificationDocument } from "@notification/interface/notification.interface";

export class GetNotification {
    public async get(req: Request, res: Response): Promise<void> {
        const notifications: INotificationDocument[] = await notificationService.getNotification(req.currentUser!.userId);
        res.status(HTTP_STATUS.OK).json({ message: 'User notifications', notifications });
    }
}
