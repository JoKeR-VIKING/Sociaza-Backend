import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { blockUserService } from '@services/db/block.user';

const log: Logger = Config.createLogger('block_worker');

class BlockUserWorker {
    async addBlockedUserToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { keyOne, keyTwo, type } = job.data;
            if (type === 'block')
                await blockUserService.block(keyOne, keyTwo);
            else
                await blockUserService.unblock(keyOne, keyTwo);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const blockUserWorker: BlockUserWorker = new BlockUserWorker();