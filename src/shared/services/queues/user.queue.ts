import { BaseQueue } from '@services/queues/base.queue'
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { userWorker } from '@workers/user.worker';
import { IUserJob } from '@user/interfaces/user.interface';

class UserQueue extends BaseQueue {
    constructor() {
        super('user');
        this.processJob('addUserToDB', 5, userWorker.addUserToDb);
        this.processJob('updateUserInfo', 5, userWorker.updateUserInfo);
        this.processJob('updateSocialLinks', 5, userWorker.updateSocialLinks);
        this.processJob('updateNotificationSettings', 5, userWorker.updateNotificationSettings);
    }

    public addUserJob(name: string, data: IUserJob):void {
        this.addJob(name, data);
    }
}

export const userQueue: UserQueue = new UserQueue();