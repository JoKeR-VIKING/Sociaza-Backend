import { IMessageData } from '@chat/interfaces/chat.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { ConversationModel } from '@chat/models/conversation.schema';
import { MessageModel } from '@chat/models/chat.schema';
import { ObjectId } from 'mongodb';

class ChatService {
    public async addMessageToDb(data: IMessageData) {
        const conversation: IConversationDocument = await ConversationModel.findOne({ _id: data!.conversationId }).exec() as IConversationDocument;
        if (!conversation) {
            await ConversationModel.create({
                _id: data!.conversationId,
                senderId: data!.senderId,
                receiverId: data!.receiverId
            });
        }

        await MessageModel.create({
            _id: data._id,
            conversationId: data.conversationId,
            receiverId: data.receiverId,
            receiverUsername: data.receiverUsername,
            receiverAvatarColor: data.receiverAvatarColor,
            receiverProfilePicture: data.receiverProfilePicture,
            senderId: data.senderId,
            senderUsername: data.senderUsername,
            senderAvatarColor: data.senderAvatarColor,
            senderProfilePicture: data.senderProfilePicture,
            body: data.body,
            isRead: data.isRead,
            gifUrl: data.gifUrl,
            selectedImage: data.selectedImage,
            reaction: data.reaction,
            createdAt: data.createdAt
        });
    }

    public async getUserConversationList(userId: ObjectId): Promise<IMessageData[]> {
        return MessageModel.aggregate([
            { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
            { $group: {
                _id: '$conversationId',
                result: { $last: '$$ROOT' }
            }},
            {
                $project: {
                    _id: '$result._id',
                    conversationId: '$result.conversationId',
                    receiverId: '$result.receiverId',
                    receiverUsername: '$result.receiverUsername',
                    receiverAvatarColor: '$result.receiverAvatarColor',
                    receiverProfilePicture: '$result.receiverProfilePicture',
                    senderId: '$result.senderId',
                    senderUsername: '$result.senderUsername',
                    senderAvatarColor: '$result.senderAvatarColor',
                    senderProfilePicture: '$result.senderProfilePicture',
                    body: '$result.body',
                    isRead: '$result.isRead',
                    gifUrl: '$result.gifUrl',
                    selectedImage: '$result.selectedImage',
                    reaction: '$result.reaction',
                    createdAt: '$result.createdAt'
                }
            },
            { $sort: { $createdAt: 1 } }
        ]);
    }

    public async getMessages(senderId: ObjectId, receiverId: ObjectId, sort: Record<string, 1 | -1>): Promise<IMessageData[]> {
        const query = {
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        };

        return MessageModel.aggregate([
            { $match: query },
            { $sort: sort }
        ]);
    }

    public async markMessageAsDeletedInDb(messageId: ObjectId, type: string): Promise<void> {
        if (type === 'deleteForMe')
            await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true } }).exec();
        else
            await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true, deleteForEveyone: true } }).exec();
    }

    public async updateMessageInDb(senderId: ObjectId, receiverId: ObjectId): Promise<void> {
        const query = {
            $or: [
                // { senderId: receiverId, isRead: false },
                { senderId: senderId, receiverId: receiverId, isRead: false }
            ]
        };

        const messages = await MessageModel.find(query);
        console.log(messages);

        await MessageModel.updateMany(query, { $set: { isRead: true } }).exec();
    }

    public async updateMessageReactionInDb(messageId: ObjectId, senderName: string, reaction: string, type: 'add' | 'remove'): Promise<void> {
        if (type === 'add') {
            await MessageModel.updateOne({ _id: messageId }, { $set: { reaction: { senderName, type: reaction } } }).exec();
        }
        else {
            await MessageModel.updateOne({ _id: messageId }, { $pull: { reaction: { senderName } } }).exec();
        }
    }
}

export const chatService: ChatService = new ChatService();