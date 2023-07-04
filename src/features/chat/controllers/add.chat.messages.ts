import { Request, response, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import { addChatSchema } from '@chat/schemes/chat';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@globals/helpers/cloudinaryUpload';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { Config } from '@root/config';
import { IChatUsers, IMessageData, IMessageNotification } from '@chat/interfaces/chat.interface';
import { socketIOChatObject } from '@sockets/chat';
import { INotificationTemplate } from '@notification/interface/notification.interface';
import { notificationTemplate } from '@services/emails/templates/notifications/notification.template';
import { emailQueue } from '@services/queues/email.queue';
import { MessageCache } from '@services/redis/message.cache';
import {chatQueue} from "@services/queues/chat.queue";
import {chatService} from "@services/db/chat.service";
import {mailTransport} from "@services/emails/mail.transporter";

const userCache: UserCache = new UserCache();
const messageCache: MessageCache = new MessageCache();

export class AddChatMessages {
    @joiValidation(addChatSchema)
    public async message(req: Request, res: Response): Promise<void> {
        const { conversationId, receiverId, receiverUsername, receiverAvatarColor, receiverProfilePicture, body, gifUrl, isRead, selectedImage } = req.body;

        let fileUrl = '';
        const messageObjectId: ObjectId = new ObjectId();
        const conversationObjectId: ObjectId = conversationId === "" ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);

        const sender: IUserDocument = await userCache.getUserFromCache(`${req.currentUser!.userId}`) as IUserDocument;

        if (selectedImage.length > 0) {
            const result: UploadApiResponse = await uploads(req.body.image, req.currentUser!.userId, true, true) as UploadApiResponse;
            if (!result.public_id)
                throw new BadRequestError(result.message);

            fileUrl = `https://res.cloudinary.com/${Config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
        }

        const messageData: IMessageData = {
            _id: `${messageObjectId}`,
            conversationId: new mongoose.Types.ObjectId(conversationObjectId),
            receiverId: receiverId,
            receiverUsername: receiverUsername,
            receiverAvatarColor: receiverAvatarColor,
            receiverProfilePicture: receiverProfilePicture,
            senderId: `${req.currentUser!.userId}`,
            senderUsername: `${req.currentUser!.username}`,
            senderAvatarColor: `${req.currentUser!.avatarColor}`,
            senderProfilePicture: sender.profilePicture,
            body: body,
            isRead: isRead,
            gifUrl: gifUrl,
            selectedImage: fileUrl,
            reaction: [],
            createdAt: new Date(),
            deleteForEveyone: false,
            deleteForMe: false
        };

        AddChatMessages.prototype.emitSocketIoEvents(messageData);

        if (!isRead) {
            AddChatMessages.prototype.messageNotification({
                currentUser: req.currentUser!,
                message: body,
                receiverName: receiverUsername,
                receiverId: receiverId,
                messageData,
            });
        }

        await messageCache.addChatListToCache(`${req.currentUser!.userId}`, `${receiverId}`, `${conversationObjectId}`);
        await messageCache.addChatListToCache(`${receiverId}`, `${req.currentUser!.userId}`, `${conversationObjectId}`);
        await messageCache.addChatMessageToCache(`${conversationObjectId}`, messageData);

        if (Config.NODE_ENV === 'development') {
            chatQueue.addChatJob('addChatMessageToDb', messageData);
        }
        else {
            await chatService.addMessageToDb(messageData);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Message added', conversationId: conversationObjectId });
    }

    public async addChatUsers(req: Request, res: Response): Promise<void> {
        const chatUsers: IChatUsers[] = await messageCache.addChatUsersToCache(req.body);
        socketIOChatObject.emit('add chat users', chatUsers);

        res.status(HTTP_STATUS.OK).json({ message: 'Users added' });
    }

    public async removeChatUsers(req: Request, res: Response): Promise<void> {
        const chatUsers: IChatUsers[] = await messageCache.removeChatUsersFromCache(req.body);
        socketIOChatObject.emit('remove chat users', chatUsers);

        res.status(HTTP_STATUS.OK).json({ message: 'Users removed' });
    }

    private emitSocketIoEvents(data: IMessageData): void {
        socketIOChatObject.emit('message received', data);
        socketIOChatObject.emit('chat list', data);
    }

    private async messageNotification(data: IMessageNotification): Promise<void> {
        const { currentUser, message, receiverName, receiverId } = data;

        const cachedUser: IUserDocument = await userCache.getUserFromCache(`${receiverId}`) as IUserDocument;
        if (!cachedUser.notifications.messages)
            return;

        const templateParams: INotificationTemplate = {
            username: receiverName,
            message: message,
            header: `Message notification from ${currentUser.username}`
        };

        const template: string = notificationTemplate.template(templateParams);

        if (Config.NODE_ENV === 'development') {
            emailQueue.addEmailJob('directMessageEmail', { receiverEmail: cachedUser.email!, template, subject: `You have received messages from ${currentUser.username}` });
        }
        else {
            await mailTransport.sendEmail(cachedUser.email!, `You have received messages from ${currentUser.username}`, template);
        }
    }
}