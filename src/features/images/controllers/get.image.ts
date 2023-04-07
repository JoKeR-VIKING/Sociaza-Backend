import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@services/redis/user.cache';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { Config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { socketIoImageObject } from '@sockets/image';
import { Helpers } from '@globals/helpers/helpers';
import { IFileImageDocument } from "@image/interfaces/image.interface";
import { imageService } from "@services/db/image.service";

export class GetImage {
    public async images(req: Request, res: Response): Promise<void> {
        const images: IFileImageDocument[] = await imageService.getImages(req.params.userId);

        res.status(HTTP_STATUS.OK).json({ message: 'User Images', images });
    }
}
