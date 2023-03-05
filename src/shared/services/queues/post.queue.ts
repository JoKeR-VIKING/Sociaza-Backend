import { BaseQueue } from '@services/queues/base.queue'
import { IPostJobData } from '@post/interfaces/post.interface';
import { postWorker } from '@workers/post.worker';

class PostQueue extends BaseQueue {
    constructor() {
        super('post');
        this.processJob('addPostToDb', 5, postWorker.addPostToDb);
        this.processJob('deletePostFromDb', 5, postWorker.deletePostFromDb);
        this.processJob('updatePostFromDb', 5, postWorker.updatePostFromDb);
    }

    public addPostJob(name: string, data: IPostJobData):void {
        this.addJob(name, data);
    }
}

export const postQueue: PostQueue = new PostQueue();