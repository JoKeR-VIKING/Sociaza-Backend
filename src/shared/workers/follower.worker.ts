import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { followerService } from '@services/db/follower.service';

const log: Logger = Config.createLogger('follower_worker');

class FollowerWorker {
    async addFollowerToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { keyOne, keyTwo, username, followerDocumentId } = job.data;
            await followerService.addFollowerToDb(keyOne, keyTwo, username, followerDocumentId);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
    
    async removeFollowerFromDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { keyOne, keyTwo } = job.data;
            await followerService.removeFollowerFromDb(keyOne, keyTwo);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const followerWorker: FollowerWorker = new FollowerWorker();