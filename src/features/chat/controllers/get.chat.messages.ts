import { Request, response, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { MessageCache } from '@services/redis/message.cache';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { Config } from '@root/config';
import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatService } from '@services/db/chat.service';

const messageCache: MessageCache = new MessageCache();

export class GetChatMessages {
    public async getConversationList(req: Request, res: Response): Promise<void> {
        let list: IMessageData[] = [];
        const cachedList: IMessageData[] = await messageCache.getUserConversationList(`${req.currentUser!.userId}`);

        if (cachedList.length) {
            list = cachedList;
        }
        else {
            list = await chatService.getUserConversationList(new mongoose.Types.ObjectId(req.currentUser!.userId));
        }

        res.status(HTTP_STATUS.OK).json({ message: 'User conversation list', list });
    }

    public async getChatMessages(req: Request, res: Response): Promise<void> {
        const { receiverId } = req.params;

        let messages: IMessageData[] = [];
        const cachedMessages: IMessageData[] = await messageCache.getChatMessagesFromCache(`${req.currentUser!.userId}`, `${receiverId}`);

        if (cachedMessages.length)
            messages = cachedMessages;
        else {
            messages = await chatService.getMessages(
                new mongoose.Types.ObjectId(req.currentUser!.userId),
                new mongoose.Types.ObjectId(receiverId),
                { createdAt: 1 }
            ) as IMessageData[];
        }

        res.status(HTTP_STATUS.OK).json({ message: 'User chat messages', messages });
    }
}