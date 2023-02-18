import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { authService } from '@services/db/auth.service';

const log: Logger = Config.createLogger('auth_worker');

class AuthWorker {
    async addAuthUserToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = job.data;
            await authService.createAuthUser(value);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const authWorker: AuthWorker = new AuthWorker();