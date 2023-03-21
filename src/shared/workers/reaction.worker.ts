import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { reactionService } from '@services/db/reaction.service';

const log: Logger = Config.createLogger('user_worker');

class ReactionWorker {
    async addReactionToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { data } = job;
            await reactionService.addReactionToDb(data);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async removeReactionFromDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { data } = job;
            await reactionService.removeReactionFromDb(data);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const reactionWorker: ReactionWorker = new ReactionWorker();