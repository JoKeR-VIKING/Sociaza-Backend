import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@services/redis/user.cache';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import { addImageSchema } from '@image/scheme/image.scheme';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@globals/helpers/cloudinaryUpload';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { Config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { socketIoImageObject } from '@sockets/image';
import { imageQueue } from '@services/queues/image.queue';
import { IBgUploadResponse } from '@image/interfaces/image.interface';
import { Helpers } from '@globals/helpers/helpers';

const userCache: UserCache = new UserCache();

export class AddImage {
    @joiValidation(addImageSchema)
    public async addProfileImage(req: Request, res: Response): Promise<void> {
        const result: UploadApiResponse = await uploads(req.body.image, req.currentUser!.userId, true, true) as UploadApiResponse;

        if (!result?.public_id) {
            throw new BadRequestError(result.message);
        }

        const url: string = `https://res.cloudinary.com/${Config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
        const cachedUser: IUserDocument = await userCache.updateSingleUserItemInCache(
            `${req.currentUser!.userId}`,
            'profilePicture',
            url
        ) as IUserDocument;

        socketIoImageObject.emit('update user', cachedUser);
        imageQueue.addImageJob('addUserProfileImageToDb', {
            key: `${req.currentUser!.userId}`,
            value: url,
            imgId: result.public_id,
            imgVersion: result.version.toString()
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully!' });
    }

    @joiValidation(addImageSchema)
    public async addBackgroundImage(req: Request, res: Response): Promise<void> {
        const { version, publicId } = await AddImage.prototype.backgroundImageUpload(req.body.image);

        const bgImageId: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
            `${req.currentUser!.userId}`,
            'bgImageId',
            publicId
        ) as Promise<IUserDocument>;

        const bgImageVersion: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
            `${req.currentUser!.userId}`,
            'bgImageVersion',
            version
        ) as Promise<IUserDocument>;

        const response: [IUserDocument, IUserDocument] = await Promise.all([bgImageId, bgImageVersion]);
        socketIoImageObject.emit('update user', {
            bgImageId: publicId,
            bgImageVersion: version,
            userId: response[0]
        });

        imageQueue.addImageJob('addBackgroundImageInDb', {
            key: `${req.currentUser!.userId}`,
            imgId: publicId,
            imgVersion: version.toString()
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Background Image added successfully!' });
    }

    private async backgroundImageUpload(image: string): Promise<IBgUploadResponse> {
        const isDataUrl: boolean = Helpers.isDataUrl(image);
        let version = '', publicId = '';
        if (isDataUrl) {
            const result: UploadApiResponse = await uploads(image) as UploadApiResponse;
            if (!result.public_id)
                throw new BadRequestError(result.message);
            else
            {
                version = result.version.toString();
                publicId = result.public_id;
            }
        }
        else {
            const value: string[] = image.split('/');
            version = value[value.length - 2];
            publicId = value[value.length - 1];
        }

        return { version: version.replace(/v/g, ''), publicId: publicId };
    }
}
