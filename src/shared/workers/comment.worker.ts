import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { commentService } from '@services/db/comment.service';

const log: Logger = Config.createLogger('comment_worker');

class CommentWorker {
    async addCommentToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { data } = job;
            await commentService.addCommentToDb(data);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const commentWorker: CommentWorker = new CommentWorker();