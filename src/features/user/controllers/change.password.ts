import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { Helpers } from "@globals/helpers/helpers";
import { userService } from "@services/db/user.service";
import { joiValidation } from "@globals/decorators/joiValidationDecorators";
import { changePasswordSchema } from "@user/schemes/info";
import { BadRequestError } from "@globals/helpers/errorHandler";
import { authService } from "@services/db/auth.service";
import { IAuthDocument } from "@auth/interfaces/auth.interface";
import {hash} from "bcryptjs";

export class ChangePassword {
    @joiValidation(changePasswordSchema)
    public async passwordUpdate(req: Request, res: Response): Promise<void> {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const existingUser: IAuthDocument = await authService.getUserByUsername(req.currentUser!.username);
        const isMatch: boolean = await existingUser.comparePassword(currentPassword);

        if (!isMatch) {
            throw new BadRequestError('Current password does not match');
        }

        if (newPassword != confirmPassword) {
            throw new BadRequestError('New passwords do not match');
        }

        const hashedPassword: string = await existingUser.hashPassword(newPassword);
        await userService.updatePassword(req.currentUser!.email, hashedPassword);

        res.status(HTTP_STATUS.OK).json({ message: 'Password updated. You will be redirected to the login page' });
    }
}