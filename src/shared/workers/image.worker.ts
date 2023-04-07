import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { imageService } from '@services/db/image.service';

const log: Logger = Config.createLogger('follower_worker');

class ImageWorker {
    async addUserProfileImageToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value, imgId, imgVersion } = job.data;
            await imageService.addUserProfileImageToDb(key, value, imgId, imgVersion);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async addBackgroundImageInDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, imgId, imgVersion } = job.data;
            await imageService.addBackgroundImageToDb(key, imgId, imgVersion);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async updateBackgroundImageInDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, imgId, imgVersion } = job.data;
            await imageService.updateBackgroundImageToDb(key, imgId, imgVersion);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async addImageToDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, imgId, imgVersion } = job.data;
            await imageService.addImage(key, imgId, imgVersion, '');
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }

    async removeImageFromDb(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { imageId } = job.data;
            await imageService.removeImage(imageId);
            job.progress(100);
            done(null, job.data);
        }
        catch (err) {
            log.error(err);
            done(err as Error);
        }
    }
}

export const imageWorker: ImageWorker = new ImageWorker();