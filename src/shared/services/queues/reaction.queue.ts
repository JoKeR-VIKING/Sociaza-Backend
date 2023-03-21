import { BaseQueue } from '@services/queues/base.queue'
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { reactionWorker } from '@workers/reaction.worker';

class ReactionQueue extends BaseQueue {
    constructor() {
        super('reaction');
        this.processJob('addReactionToDb', 5, reactionWorker.addReactionToDb);
        this.processJob('removeReactionFromDb', 5, reactionWorker.removeReactionFromDb);
    }

    public addReactionJob(name: string, data: IReactionJob):void {
        this.addJob(name, data);
    }
}

export const reactionQueue: ReactionQueue = new ReactionQueue();