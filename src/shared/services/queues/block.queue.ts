import { BaseQueue } from '@services/queues/base.queue';
import { blockUserWorker } from '@workers/block.worker';
import { IBlockedUserJobData } from '@follower/interfaces/follower.interface';

class BlockUserQueue extends BaseQueue {
    constructor() {
        super('blockUser');
        this.processJob('changeBlockStatusInDb', 5, blockUserWorker.addBlockedUserToDb);
    }

    public addBlockUserJob(name: string, data: IBlockedUserJobData): void {
        this.addJob(name, data);
    }
}

export const blockUserQueue: BlockUserQueue = new BlockUserQueue();