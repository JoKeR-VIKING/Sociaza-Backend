import { Request, Response } from 'express';
import { Config } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import { emailSchema, passwordResetSchema } from '@auth/schemes/password.scheme';
import crypto from 'crypto';
import { forgotPasswordTemplate } from '@services/emails/templates/forgotPassword/forgot.password.template';
import { resetPasswordTemplate } from '@services/emails/templates/resetPassword/reset.password.template';
import { emailQueue } from '@services/queues/email.queue';
import publicIp from 'ip';
import {passwordSchema} from "@auth/schemes/signup.scheme";

export class Password {
    @joiValidation(emailSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const { email } = req.body;
        const user: IAuthDocument = await authService.getUserByEmail(email);

        if (!user)
            throw new BadRequestError('User with email does not exist.');

        const randomBytes: Buffer = await crypto.randomBytes(20);
        const randomCharacters: string = randomBytes.toString('hex');

        await authService.updateAuthUser(`${user._id}`, randomCharacters, Date.now() * 3600 * 1000);

        const resetLink: string = `${Config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
        const template: string = forgotPasswordTemplate.template(user.username, resetLink);
        emailQueue.addEmailJob('forgotPasswordEmail', {
            receiverEmail: email,
            template: template,
            subject: 'Password reset link',
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent' });
    }

    @joiValidation(passwordResetSchema)
    public async update(req: Request, res: Response): Promise<void> {
        const { password, confirmPassword } = req.body;

        const err: any[] = passwordSchema.validate(password, { details: true }) as any[];

        if (err.length > 0)
            throw new BadRequestError(err[0].message);

        const { token } = req.params;
        const user: IAuthDocument = await authService.getUserByPasswordToken(token);
        if (!user)
            throw new BadRequestError('The reset link is invalid. Please try again.');

        user.password = password;
        user.passwordResetToken = user.passwordResetExpires = undefined;
        await user.save();

        const template: string = resetPasswordTemplate.template(user.username, user.email, publicIp.address());
        emailQueue.addEmailJob('forgotPasswordEmail', {
            receiverEmail: user.email,
            template: template,
            subject: 'Password reset confirmation',
        });

        res.status(HTTP_STATUS.OK).json({ message: 'Password reset confirmation sent' });
    }
}
