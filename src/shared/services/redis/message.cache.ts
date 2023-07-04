import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { ServerError } from '@globals/helpers/errorHandler';
import {
    IChatList,
    IChatUsers,
    IGetMessageFromCache,
    IMessageData,
    IMessageDocument
} from '@chat/interfaces/chat.interface';
import { Helpers } from '@globals/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands'
import { find, findIndex, filter, remove } from 'lodash';
import {IReaction} from "@reaction/interfaces/reaction.interface";

const log: Logger = Config.createLogger('messageCache');

export class MessageCache extends BaseCache {
    constructor() {
        super('messageCache');
    }

    public async addChatListToCache(senderId: string, receiverId: string, conversationId: string): Promise<void> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
            if (userChatList.length == 0)
                await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
            else {
                const receiverIndex: number = findIndex(userChatList, (listItem: string) => {
                    return listItem.includes(receiverId);
                });

                if (receiverIndex < 0)
                    await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));

                await this.client.disconnect();
            }
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }

    public async addChatMessageToCache(conversationId: string, value: IMessageData): Promise<void> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            await this.client.RPUSH(`messages:${conversationId}`, JSON.stringify(value));
            await this.client.disconnect();
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }

    public async addChatUsersToCache(value: IChatUsers): Promise<IChatUsers[]> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const users: IChatUsers[] = await this.getChatUsersList();
            const usersIndex: number = findIndex(users, (listitem: IChatUsers) => {
                return JSON.stringify(listitem) === JSON.stringify(value);
            });

            let chatUsers: IChatUsers[] = [];

            if (usersIndex === -1) {
                await this.client.RPUSH('chatUsers', JSON.stringify(value));
                chatUsers = await this.getChatUsersList();
            }
            else {
                chatUsers = users;
            }

            await this.client.disconnect();
            return chatUsers;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }

    public async removeChatUsersFromCache(value: IChatUsers): Promise<IChatUsers[]> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const users: IChatUsers[] = await this.getChatUsersList();
            const usersIndex: number = findIndex(users, (listitem: IChatUsers) => {
                return JSON.stringify(listitem) === JSON.stringify(value);
            });

            let chatUsers: IChatUsers[] = [];

            if (usersIndex !== -1) {
                await this.client.LREM('chatUsers', usersIndex, JSON.stringify(value));
                chatUsers = await this.getChatUsersList();
            }
            else {
                chatUsers = users;
            }

            await this.client.disconnect();
            return chatUsers;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }

    public async getUserConversationList(key: string): Promise<IMessageData[]> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const userChatList: string[] = await this.client.LRANGE(`chatList:${key}`, 0, -1);
            const conversationChatList: IMessageData[] = [];

            for (const item of userChatList) {
                const chatItem: IChatList = Helpers.parseJson(item) as IChatList;
                const lastMessage: string = await this.client.LINDEX(`messages:${chatItem.conversationId}`, -1) as string;

                conversationChatList.push(Helpers.parseJson(lastMessage));
            }

            await this.client.disconnect();
            return conversationChatList;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }

    public async getChatMessagesFromCache(senderId: string, receiverId: string): Promise<IMessageData[]> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
            const receiver: string = find(userChatList, (listItem: string) => {
                return listItem.includes(receiverId);
            }) as string;

            const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;

            if (parsedReceiver) {
                const userMessages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
                const chatMessages: IMessageData[] = [];

                for (const item of userMessages) {
                    chatMessages.push(Helpers.parseJson(item) as IMessageData);
                }

                await this.client.disconnect();
                return chatMessages;
            }
            else {
                await this.client.disconnect();
                return [];
            }
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }

    public async markMessageAsDelete(senderId: string, receiverId: string, messageId: string, type: string): Promise<IMessageData> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const { index, message, receiver } = await this.getMessages(senderId, receiverId, messageId);
            const chatItem: IMessageData = Helpers.parseJson(message) as IMessageData;

            chatItem.deleteForMe = true;
            if (type !== 'deleteForMe')
                chatItem.deleteForEveyone = true;

            await this.client.LSET(`messages:${receiver.conversationId}`, index, JSON.stringify(chatItem));
            await this.client.disconnect();
            return chatItem;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }

    public async updateChatMessages(senderId: string, receiverId: string): Promise<IMessageData> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
            const receiver: string = find(userChatList, (listItem: string) => {
                return listItem.includes(receiverId);
            }) as string;

            const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;
            const messages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
            const unread: string[] = filter(messages, (listItem: string) => {
                return !Helpers.parseJson(listItem).isRead;
            });

            for (const item of unread) {
                const chatItem = Helpers.parseJson(item) as IMessageData;
                const index = findIndex(messages, (listItem: string) => {
                    return listItem.includes(`${chatItem._id}`);
                });

                chatItem.isRead = true;

                await this.client.LSET(`messages:${parsedReceiver.conversationId}`, index, JSON.stringify(chatItem));
            }

            const lastMessage: string = await this.client.LINDEX(`messages:${parsedReceiver.conversationId}`, -1) as string;
            await this.client.disconnect();
            return Helpers.parseJson(lastMessage) as IMessageData;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }

    private async getMessages(senderId: string, receiverId: string, messageId: string): Promise<IGetMessageFromCache> {
        const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);

        const receiver: string = find(userChatList, (listItem: string) => {
            return listItem.includes(receiverId);
        }) as string;

        const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;

        const messages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
        const message: string = find(messages, (listItem: string) => {
            return listItem.includes(messageId);
        }) as string;

        const index: number = findIndex(messages, (listItem: string) => {
            return listItem.includes(messageId);
        });

        await this.client.disconnect();
        return { index, message, receiver: parsedReceiver };
    }

    public async getChatUsersList(): Promise<IChatUsers[]> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const chatUsersList: IChatUsers[] = [];
            const chatUsers = await this.client.LRANGE(`chatUsers`, 0, -1);

            for (const item of chatUsers) {
                const chatUser: IChatUsers = Helpers.parseJson(item) as IChatUsers;
                chatUsersList.push(chatUser);
            }

            await this.client.disconnect();
            return chatUsersList;
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }

    public async updateMessageReaction(conversationId: string, messageId: string, reaction: string, senderName: string, type: 'add' | 'remove'): Promise<IMessageData> {
        try {
            if (!this.client.isOpen)
                await this.client.connect();

            const messages: string[] = await this.client.LRANGE(`messages:${conversationId}`, 0, -1);
            const messageIndex: number = findIndex(messages, (listItem: string) => {
                return listItem.includes(messageId);
            }) as number;
            const message: string = await this.client.LINDEX(`messages:${conversationId}`, messageIndex) as string;
            const parsedMessage: IMessageData = Helpers.parseJson(message) as IMessageData;

            const reactions: IReaction[] = [];

            if (parsedMessage) {
                remove(parsedMessage.reaction, (reaction: IReaction) => {
                    return reaction.senderName = senderName;
                });

                if (type === 'add') {
                    reactions.push({ senderName: senderName, type: reaction });
                    parsedMessage.reaction = [...parsedMessage.reaction, ...reactions];
                    await this.client.LSET(`messages:${conversationId}`, messageIndex, JSON.stringify(parsedMessage));
                }
                else {
                    await this.client.LSET(`messages:${conversationId}`, messageIndex, JSON.stringify(parsedMessage));
                }
            }

            const updatedMessage: string = await this.client.LINDEX(`messages:${conversationId}`, messageIndex) as string;
            await this.client.disconnect();
            return Helpers.parseJson(updatedMessage);
        }
        catch (err) {
            log.error(err);
            throw new ServerError('Server Error. Try again.');
        }
    }
}
