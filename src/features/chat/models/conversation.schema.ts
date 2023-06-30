import mongoose, { model, Model, Schema } from 'mongoose';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';

const conversationSchema: Schema = new Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiveId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export const ConversationModel: Model<IConversationDocument> = model<IConversationDocument>('Conversation', conversationSchema, 'Conversation');