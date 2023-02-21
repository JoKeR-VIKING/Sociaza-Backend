import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { Config } from '@root/config';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { signinSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@services/db/user.service';
import { mailTransport } from '@services/emails/mail.transporter';
import { emailQueue} from '@services/queues/email.queue';
import { resetPasswordTemplate } from '@services/emails/templates/resetPassword/reset.password.template';
import publicIp from 'ip';

export class SignIn {
    @joiValidation(signinSchema)
    public async read(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        const authUser: IAuthDocument = await authService.getUserByUsername(username);

        if (!authUser) {
            throw new BadRequestError('No such username exists!');
        }

        const passwordMatch: boolean = await authUser.comparePassword(password);

        if (!passwordMatch) {
            throw new BadRequestError('Incorrect password!');
        }

        const user: IUserDocument = await userService.getUserByAuthId(`${authUser._id}`);

        const userJwt: string = JWT.sign({
            userId: user.authId,
            uId: authUser.uId,
            email: authUser.email,
            username: authUser.username,
            avatarColor: authUser.avatarColor
        }, Config.JWT_TOKEN!);

        req.session = { jwt: userJwt };

        const userDocument: IUserDocument = {
            ...user,
            authId: authUser._id,
            username: authUser.username,
            email: authUser.email,
            avatarColor: authUser.avatarColor,
            uId: authUser.uId,
            createdAt: authUser.createdAt
        } as IUserDocument;

        const template: string = resetPasswordTemplate.template(username, authUser.email!, publicIp.address());
        emailQueue.addEmailJob('forgotPasswordEmail', {
            receiverEmail: 'tyrese.runolfsdottir@ethereal.email',
            template: template,
            subject: 'Password reset completed confirmation'
        });

        res.status(HTTP_STATUS.OK).json({ message: 'User logged in successfully', user: userDocument, token: userJwt });
    }
}
