import { BaseQueue } from '@services/queues/base.queue'
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { authWorker } from '@workers/auth.worker';

class AuthQueue extends BaseQueue {
    constructor() {
        super('auth');
        this.processJob('addUserAuthToDB', 5, authWorker.addAuthUserToDb);
    }

    public addAuthUserJob(name: string, data: IAuthJob):void {
        this.addJob(name, data);
    }
}

export const authQueue: AuthQueue = new AuthQueue();