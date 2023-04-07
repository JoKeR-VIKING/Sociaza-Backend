import { BaseQueue } from '@services/queues/base.queue';
import { imageWorker } from '@workers/image.worker';
import { IFileImageJobData } from '@image/interfaces/image.interface';

class ImageQueue extends BaseQueue {
    constructor() {
        super('follower');
        this.processJob('addUserProfileImageToDb', 5, imageWorker.addUserProfileImageToDb);
        this.processJob('addBackgroundImageInDb', 5, imageWorker.addBackgroundImageInDb);
        this.processJob('updateBackgroundImageInDb', 5, imageWorker.updateBackgroundImageInDb);
        this.processJob('addImageToDb', 5, imageWorker.addImageToDb);
        this.processJob('removeImageFromDb', 5, imageWorker.removeImageFromDb);
    }

    public addImageJob(name: string, data: IFileImageJobData): void {
        this.addJob(name, data);
    }
}

export const imageQueue: ImageQueue = new ImageQueue();