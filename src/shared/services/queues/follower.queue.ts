import { BaseQueue } from '@services/queues/base.queue';
import { followerWorker } from '@workers/follower.worker';
import { IFollowerJobData } from '@follower/interfaces/follower.interface';

class FollowerQueue extends BaseQueue {
    constructor() {
        super('follower');
        this.processJob('addFollowerToDb', 5, followerWorker.addFollowerToDb);
        this.processJob('removeFollowerFromDb', 5, followerWorker.removeFollowerFromDb);
    }

    public addFollowerJob(name: string, data: IFollowerJobData): void {
        this.addJob(name, data);
    }
}

export const followerQueue: FollowerQueue = new FollowerQueue();