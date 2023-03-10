import { BaseQueue } from '@services/queues/base.queue'
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { userWorker } from '@workers/user.worker';

class UserQueue extends BaseQueue {
    constructor() {
        super('user');
        this.processJob('addUserToDB', 5, userWorker.addUserToDb);
    }

    public addUserJob(name: string, data: any):void {
        this.addJob(name, data);
    }
}

export const userQueue: UserQueue = new UserQueue();