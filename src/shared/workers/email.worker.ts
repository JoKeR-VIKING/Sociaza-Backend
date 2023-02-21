import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { mailTransport } from '@services/emails/mail.transporter';

const log: Logger = Config.createLogger('email_worker');

class EmailWorker {
    async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { template, receiverEmail, subject } = job.data;
            await mailTransport.sendEmail(receiverEmail, subject, template);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const emailWorker: EmailWorker = new EmailWorker();