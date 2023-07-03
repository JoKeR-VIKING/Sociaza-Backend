import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { chatService } from '@services/db/chat.service';
import {Callback} from "mongoose";

const log: Logger = Config.createLogger('chat_worker');

class ChatWorker {
    async addChatMessageToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            await chatService.addMessageToDb(job.data);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async markMessageAsDeletedInDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { messageId, type } = job.data;
            await chatService.markMessageAsDeletedInDb(messageId, type);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async updateMessageInDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { senderId, receiverId } = job.data;
            await chatService.updateMessageInDb(senderId, receiverId);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async updateReactionInDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { messageId, senderName, reaction, type } = job.data;
            await chatService.updateMessageReactionInDb(messageId, senderName, reaction, type);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const chatWorker: ChatWorker = new ChatWorker();