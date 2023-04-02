import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { notificationService } from '@services/db/notification.service';

const log: Logger = Config.createLogger('notification_worker');

class NotificationWorker {
    async updateNotification(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key } = job.data;
            await notificationService.updateNotification(key);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async deleteNotification(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key } = job.data;
            await notificationService.deleteNotification(key);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();