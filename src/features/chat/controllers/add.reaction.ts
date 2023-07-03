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

export class AddReaction {
    public async updateReaction(req: Request, res: Response): Promise<void> {
        const { conversationId, messageId, reaction, type } = req.body;

        const updatedMessage: IMessageData = await messageCache.updateMessageReaction(`${conversationId}`, `${messageId}`, `${reaction}`, `${req.currentUser!.username}`, type);
        socketIOChatObject.emit('message reaction', updatedMessage);

        chatQueue.addChatJob('updateReactionInDb', {
            messageId: new mongoose.Types.ObjectId(messageId),
            senderName: req.currentUser!.username,
            reaction: reaction,
            type: type
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Message reaction added' });
    }
}
