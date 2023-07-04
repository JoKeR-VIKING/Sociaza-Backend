import { Request, response, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { Config } from '@root/config';
import { IChatUsers, IMessageData, IMessageNotification } from '@chat/interfaces/chat.interface';
import { socketIOChatObject } from '@sockets/chat';
import { MessageCache } from '@services/redis/message.cache';
import { chatQueue } from '@services/queues/chat.queue';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import { markChatSchema } from '@chat/schemes/chat';
import {chatService} from "@services/db/chat.service";

const messageCache: MessageCache = new MessageCache();

export class UpdateChatMessage {
    @joiValidation(markChatSchema)
    public async markMessageAsRead(req: Request, res: Response): Promise<void> {
        const { senderId, receiverId } = req.body;

        const updatedMessage: IMessageData = await messageCache.updateChatMessages(`${senderId}`, `${receiverId}`);
        socketIOChatObject.emit('message read', updatedMessage);
        socketIOChatObject.emit('chat list', updatedMessage);

        if (Config.NODE_ENV === 'development') {
            chatQueue.addChatJob('updateMessageInDb', {
                senderId: new mongoose.Types.ObjectId(senderId),
                receiverId: new mongoose.Types.ObjectId(receiverId)
            });
        }
        else {
            chatService.updateMessageInDb(senderId, receiverId);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Message read' });
    }
}
