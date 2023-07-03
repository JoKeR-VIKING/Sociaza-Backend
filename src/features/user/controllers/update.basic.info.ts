import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@globals/helpers/helpers';
import { userService } from '@services/db/user.service';
import { UserCache } from '@services/redis/user.cache';
import { userQueue } from '@services/queues/user.queue';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import {basicInfoSchema, notificationsSettingsSchema, socialLinksSchema} from '@user/schemes/info';

const userCache: UserCache = new UserCache();

export class UpdateBasicInfo {
    @joiValidation(basicInfoSchema)
    public async updateUserInfo(req: Request, res: Response): Promise<void> {
        for (const [key, value] of Object.entries(req.body)) {
            await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, key, `${value}`);
        }

        userQueue.addUserJob('updateUserInfo', {
            key: `${req.currentUser!.userId}`,
            value: req.body
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Updated info successfully' });
    }

    @joiValidation(socialLinksSchema)
    public async updateUserSocial(req: Request, res: Response): Promise<void> {
        await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'social', req.body);

        userQueue.addUserJob('updateSocialLinks', {
            key: `${req.currentUser!.userId}`,
            value: req.body
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Updated social links successfully' });
    }

    @joiValidation(notificationsSettingsSchema)
    public async updateNotifiationSettings(req: Request, res: Response): Promise<void> {
        await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'notifications', req.body);

        userQueue.addUserJob('updateNotificationSettings', {
            key: `${req.currentUser!.userId}`,
            value: req.body
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Updated notification settings', settings: req.body });
    }
}