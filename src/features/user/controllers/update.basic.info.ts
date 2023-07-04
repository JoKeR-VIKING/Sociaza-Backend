import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@globals/helpers/helpers';
import { userService } from '@services/db/user.service';
import { UserCache } from '@services/redis/user.cache';
import { userQueue } from '@services/queues/user.queue';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import {basicInfoSchema, notificationsSettingsSchema, socialLinksSchema} from '@user/schemes/info';
import {Config} from "@root/config";

const userCache: UserCache = new UserCache();

export class UpdateBasicInfo {
    @joiValidation(basicInfoSchema)
    public async updateUserInfo(req: Request, res: Response): Promise<void> {
        for (const [key, value] of Object.entries(req.body)) {
            await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, key, `${value}`);
        }

        if (Config.NODE_ENV === 'development') {
            userQueue.addUserJob('updateUserInfo', {
                key: `${req.currentUser!.userId}`,
                value: req.body
            });
        }
        else {
            await userService.updateUserInfo(`${req.currentUser!.userId}`, req.body);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Updated info successfully' });
    }

    @joiValidation(socialLinksSchema)
    public async updateUserSocial(req: Request, res: Response): Promise<void> {
        await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'social', req.body);

        if (Config.NODE_ENV === 'development') {
            userQueue.addUserJob('updateSocialLinks', {
                key: `${req.currentUser!.userId}`,
                value: req.body
            });
        }
        else {
            await userService.updateSocialFields(`${req.currentUser!.userId}`, req.body);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Updated social links successfully' });
    }

    @joiValidation(notificationsSettingsSchema)
    public async updateNotifiationSettings(req: Request, res: Response): Promise<void> {
        await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'notifications', req.body);

        if (Config.NODE_ENV === 'development') {
            userQueue.addUserJob('updateNotificationSettings', {
                key: `${req.currentUser!.userId}`,
                value: req.body
            });
        }
        else {
            await userService.updateNotificationSettings(`${req.currentUser!.userId}`, req.body);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Updated notification settings', settings: req.body });
    }
}