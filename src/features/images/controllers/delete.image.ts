import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@services/redis/user.cache';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { Config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { socketIoImageObject } from '@sockets/image';
import { imageQueue } from '@services/queues/image.queue';
import { Helpers } from '@globals/helpers/helpers';
import { IFileImageDocument } from '@image/interfaces/image.interface';
import { imageService } from '@services/db/image.service';

const userCache: UserCache = new UserCache();

export class DeleteImage {
    public async deleteImage(req: Request, res: Response): Promise<void> {
        const { imageId } = req.params;

        socketIoImageObject.emit('delete image', imageId);

        imageQueue.addImageJob('removeImageFromDb', {
            imageId: imageId
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully.' });
    }

    public async deleteBackgroundImage(req: Request, res: Response): Promise<void> {
        const image: IFileImageDocument = await imageService.getImageByBackgroundId(req.params.bgImageId);

        socketIoImageObject.emit('delete image', image._id);

        const bgImageId: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
            `${req.currentUser!.userId}`,
            'bgImageId',
            ''
        ) as Promise<IUserDocument>;

        const bgImageVersion: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
            `${req.currentUser!.userId}`,
            'bgImageVersion',
            ''
        ) as Promise<IUserDocument>;

        await Promise.all([bgImageId, bgImageVersion]);

        imageQueue.addImageJob('removeImageFromDb', {
            imageId: image._id
        });

        imageQueue.addImageJob('updateBackgroundImageInDb', {
            key: req.currentUser!.userId,
            imgId: '',
            imgVersion: ''
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully.' });
    }
}
