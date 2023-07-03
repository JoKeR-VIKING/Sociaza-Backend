import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { userService } from '@services/db/user.service';

const log: Logger = Config.createLogger('user_worker');

class UserWorker {
    async addUserToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = job.data;
            await userService.createUser(value);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async updateUserInfo(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = job.data;
            await userService.updateUserInfo(key, value);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async updateSocialLinks(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = job.data;
            await userService.updateSocialFields(key, value);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async updateNotificationSettings(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = job.data;
            await userService.updateNotificationSettings(key, value);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const userWorker: UserWorker = new UserWorker();