import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignupData } from '@auth/interfaces/auth.interface';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { Helpers } from '@globals/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@globals/helpers/cloudinaryUpload';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@services/redis/user.cache';
import { Config } from '@root/config';
import { omit } from 'lodash';
import { authQueue } from '@services/queues/auth.queue';
import { userQueue } from '@services/queues/user.queue';
import { valid } from 'joi';
import JWT from 'jsonwebtoken';

const userCache: UserCache = new UserCache();

export class SignUp {
    @joiValidation(signupSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const { username, password, email, avatarColor, avatarImage } = req.body;
        const checkIfUserExists: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);

        if (checkIfUserExists)
            throw new BadRequestError('Username or email already exists');

        const authObjectId: ObjectId = new ObjectId();
        const userObjectId: ObjectId = new ObjectId();
        const uId = `${Helpers.generateRandomIntegers(12)}`;
        const authData: IAuthDocument = SignUp.prototype.signUpData({
            _id: authObjectId,
            uId: uId,
            username: username,
            email: email,
            password: password,
            avatarColor: avatarColor
        });
        const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;

        if (!result?.public_id) {
            throw new BadRequestError('File upload: Error occured while uploading image');
        }

        const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
        userDataForCache.profilePicture = `https://res.cloudinary.com/${Config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
        await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

        omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
        authQueue.addAuthUserJob('addUserAuthToDB', { value: userDataForCache });
        userQueue.addUserJob('addUserToDB', { value: userDataForCache });

        const userJwt: string = SignUp.prototype.signUpToken(authData, userObjectId);
        req.session = { jwt: userJwt };

        res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
    }

    private signUpToken(data: IAuthDocument, userObjectId: ObjectId): string {
        return JWT.sign({
            userId: userObjectId,
            uId: data.uId,
            email: data.email,
            username: data.username,
            avatarColor: data.avatarColor
        }, Config.JWT_TOKEN!);
    }

    private signUpData(data: ISignupData): IAuthDocument {
        return {
            _id: data._id,
            uId: data.uId,
            username: Helpers.firstLetterUppercase(data.username),
            email: Helpers.lowercase(data.email),
            password: data.password,
            avatarColor: data.avatarColor,
            createdAt: new Date()
        } as IAuthDocument;
    }

    private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
        const { _id, username, email, uId, password, avatarColor } = data;

        return {
            _id: userObjectId,
            authId: _id,
            uId: uId,
            username: Helpers.firstLetterUppercase(username),
            email: email,
            password: password,
            avatarColor: avatarColor,
            profilePicture: '',
            blocked: [],
            blockedBy: [],
            work: '',
            location: '',
            school: '',
            quote: '',
            bgImageVersion: '',
            bgImageId: '',
            followersCount: 0,
            followingCount: 0,
            notifications: {
                messages: true,
                reactions: true,
                comments: true,
                follows: true
            },
            social: {
                facebook: '',
                instagram: '',
                twitter: '',
                youtube: ''
            }
        } as unknown as IUserDocument;
    }
}
