import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Signout {
    public async signout(req: Request, res: Response): Promise<void> {
        req.session = null;
        res.status(HTTP_STATUS.OK).json({ message: "User logged out successfully", user: {}, token: '' });
    }
}
