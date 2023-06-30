import mongoose, { model, Model, Schema } from 'mongoose';
import { IMessageDocument } from '@chat/interfaces/chat.interface';

const messageSchema: Schema = new Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderUsername: { type: String, default: '' },
    senderAvatarColor: { type: String, default: '' },
    senderProfilePicture: { type: String, default: '' },
    receiverUsername: { type: String, default: '' },
    receiverAvatarColor: { type: String, default: '' },
    receiverProfilePicture: { type: String, default: '' },
    body: { type: String, default: '' },
    gifUrl: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    deleteForMe: { type: Boolean, default: false },
    deleteForEveryOne: { type: Boolean, default: false },
    selectedImage: { type: String, default: '' },
    reaction: { type: Array },
    createdAt: { type: Date, default: Date.now }
});

export const MessageModel: Model<IMessageDocument> = model<IMessageDocument>('Message', messageSchema, 'Message');