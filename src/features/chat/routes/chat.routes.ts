import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/authMiddleware';
import { AddChatMessages } from '@chat/controllers/add.chat.messages';
import { GetChatMessages } from '@chat/controllers/get.chat.messages';
import { DeleteChatMessages } from "@chat/controllers/delete.chat.messages";
import { UpdateChatMessage } from "@chat/controllers/update.chat.message";
import { AddReaction } from "@chat/controllers/add.reaction";

class ChatRoutes {
    private readonly chatRouter: Router;

    constructor () {
        this.chatRouter = express.Router();
    }

    public routes(): Router {
        this.chatRouter.post('/chat/message', authMiddleware.checkAuthentication, AddChatMessages.prototype.message);
        this.chatRouter.post('/chat/message/add-chat-users', authMiddleware.checkAuthentication, AddChatMessages.prototype.addChatUsers);
        this.chatRouter.post('/chat/message/remove-chat-users', authMiddleware.checkAuthentication, AddChatMessages.prototype.removeChatUsers);

        this.chatRouter.get('/chat/message/conversation-list', authMiddleware.checkAuthentication, GetChatMessages.prototype.getConversationList);
        this.chatRouter.get('/chat/message/user/:receiverId', authMiddleware.checkAuthentication, GetChatMessages.prototype.getChatMessages);

        this.chatRouter.delete('/chat/message/delete/:messageId/:senderId/:receiverId/:type', authMiddleware.checkAuthentication, DeleteChatMessages.prototype.markMessageAsDeleted);

        this.chatRouter.put('/chat/message/update', authMiddleware.checkAuthentication, UpdateChatMessage.prototype.markMessageAsRead);

        this.chatRouter.put('/chat/message/reaction', authMiddleware.checkAuthentication, AddReaction.prototype.updateReaction);

        return this.chatRouter;
    }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();