import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { postService } from '@services/db/post.service';
import {IPostDocument} from "@post/interfaces/post.interface";

const log: Logger = Config.createLogger('post_worker');

class PostWorker {
    async addPostToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = job.data;
            await postService.createPost(key, value);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async deletePostFromDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { keyOne, keyTwo } = job.data;
            await postService.deletePost(keyOne, keyTwo);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async updatePostFromDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = job.data;
            await postService.updatePost(key, value as IPostDocument);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const postWorker: PostWorker = new PostWorker();