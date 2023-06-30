import mongoose, { Document } from 'mongoose';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { IReaction } from '@reaction/interfaces/reaction.interface';

export interface IMessageDocument extends Document {
    _id: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    senderUsername: string;
    senderAvatarColor: string;
    senderProfilePicture: string;
    receiverUsername: string;
    receiverAvatarColor: string;
    receiverProfilePicture: string;
    body: string;
    gifUrl: string;
    isRead: boolean;
    selectedImage: string[];
    reaction: IReaction[];
    createdAt: Date;
    deleteForMe: boolean;
    deleteForEveyone: boolean;
}

export interface IMessageData {
    _id: mongoose.Types.ObjectId | string;
    conversationId: mongoose.Types.ObjectId;
    senderId: string;
    receiverId: string;
    senderUsername: string;
    senderAvatarColor: string;
    senderProfilePicture: string;
    receiverUsername: string;
    receiverAvatarColor: string;
    receiverProfilePicture: string;
    body: string;
    gifUrl: string;
    isRead: boolean;
    selectedImage: string;
    reaction: IReaction[];
    createdAt: Date;
    deleteForMe: boolean;
    deleteForEveyone: boolean;
}

export interface IMessageNotification {
    currentUser: AuthPayload;
    message: string;
    receiverName: string;
    receiverId: string;
    messageData: IMessageData;
}

export interface IChatUsers {
    userOne: string;
    userTwo: string;
}

export interface IChatList {
    receiverId: string;
    conversationId: string;
}

export interface ITyping {
    sender: string;
    receiver: string;
}

export interface IChatJobData {
    senderId?: mongoose.Types.ObjectId | string;
    receiverId?: mongoose.Types.ObjectId | string;
    messageId?: mongoose.Types.ObjectId | string;
    senderName?: string;
    reaction?: string;
    type?: string;
}

export interface ISenderReceiver {
    senderId: string;
    receiverId: string;
    senderName: string;
    receiverName: string;
}

export interface IGetMessageFromCache {
    index: number;
    message: string;
    receiver: IChatList;
}
