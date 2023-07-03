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

const messageCache: MessageCache = new MessageCache();

export class DeleteChatMessages {
    public async markMessageAsDeleted(req: Request, res: Response): Promise<void> {
        const { messageId, senderId, receiverId, type } = req.params;

        const updatedMessage: IMessageData = await messageCache.markMessageAsDelete(`${senderId}`, `${receiverId}`, `${messageId}`, type);
        socketIOChatObject.emit('message read', updatedMessage);
        socketIOChatObject.emit('chat list', updatedMessage);

        chatQueue.addChatJob('markMessageAsDeletedInDb', {
            messageId: new mongoose.Types.ObjectId(messageId),
            type: type
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Message deleted' });
    }
}
