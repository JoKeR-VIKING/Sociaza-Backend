import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@globals/helpers/helpers';
import { userService } from '@services/db/user.service';
import { ISearchUser } from '@user/interfaces/user.interface';

export class SearchUsers {
    public async search(req: Request, res: Response): Promise<void> {
        const regex = new RegExp(Helpers.escapeRegex(req.params.query), 'i');
        const users: ISearchUser[] = await userService.searchUsersInDB(regex);

        res.status(HTTP_STATUS.OK).json({ message: 'Searched users', users });
    }
}