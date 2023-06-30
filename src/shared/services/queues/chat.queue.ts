import { BaseQueue } from '@services/queues/base.queue'
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { chatWorker } from '@workers/chat.worker';
import { IChatJobData, IMessageData } from '@chat/interfaces/chat.interface';

class ChatQueue extends BaseQueue {
    constructor() {
        super('chat');
        this.processJob('addChatMessageToDb', 5, chatWorker.addChatMessageToDb);
        this.processJob('markMessageAsDeletedInDb', 5, chatWorker.markMessageAsDeletedInDb);
        this.processJob('updateMessageInDb', 5, chatWorker.updateMessageInDb);
        this.processJob('updateReactionInDb', 5, chatWorker.updateReactionInDb);
    }

    public addChatJob(name: string, data: IChatJobData | IMessageData):void {
        this.addJob(name, data);
    }
}

export const chatQueue: ChatQueue = new ChatQueue();