import mongoose, {model, Model, Schema} from 'mongoose';
import {INotification, INotificationDocument} from '@notification/interface/notification.interface';
import {notificationService} from '@services/db/notification.service';
import {Config} from '@root/config';
import Logger from 'bunyan';

const log: Logger = Config.createLogger('notificationSchema');

const notificationSchema: Schema = new Schema({
    userTo: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    userFrom: { type: mongoose.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    message: { type: String, default: '' },
    notificationType: { type: String },
    entityId: { type: mongoose.Types.ObjectId },
    comment: { type: String, default: '' },
    reaction: { type: String, default: '' },
    post: { type: String, default: '' },
    imgId: { type: String, default: '' },
    imgVersion: { type: String, default: '' },
    gifUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now() }
});

notificationSchema.methods.insertNotification = async function (body: INotification) {
    const {
        userTo,
        userFrom,
        message,
        notificationType,
        entityId,
        createdItemId,
        comment,
        reaction,
        post,
        imgId,
        imgVersion,
        gifUrl
    } = body;

    await NotificationModel.create({
        userTo: userTo,
        userFrom: userFrom,
        message: message,
        notificationType: notificationType,
        entityId: entityId,
        createdItemId: createdItemId,
        comment: comment,
        reaction: reaction,
        post: post,
        imgId: imgId,
        imgVersion: imgVersion,
        gifUrl: gifUrl
    });

    try {
        return await notificationService.getNotification(userTo);
    }
    catch (err) {
        log.error(err);
        return err;
    }
}

export const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>('Notification', notificationSchema, 'Notification');