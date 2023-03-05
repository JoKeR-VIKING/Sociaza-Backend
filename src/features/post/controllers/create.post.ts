import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { postSchema, postWithImageSchema } from '@post/schemes/post.scheme';
import { ObjectId } from 'mongodb';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { PostCache } from '@services/redis/post.cache';
import { socketIoPostObject} from '@sockets/post.socket';
import { postQueue } from '@services/queues/post.queue';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@globals/helpers/cloudinaryUpload';
import { BadRequestError } from '@globals/helpers/errorHandler';

const postCache: PostCache = new PostCache();

export class CreatePost {
    @joiValidation(postSchema)
    public async post(req: Request, res: Response): Promise<void> {
        const { post, bgColor, privacy, feelings, gifUrl, profilePicture } = req.body;

        const postObjectId: ObjectId = new ObjectId();
        const createdPost: IPostDocument = {
            _id: postObjectId,
            userId: req.currentUser!.userId,
            username: req.currentUser!.username,
            email: req.currentUser!.email,
            avatarColor: req.currentUser!.avatarColor,
            profilePicture: profilePicture,
            post: post,
            bgColor: bgColor,
            feelings: feelings,
            privacy: privacy,
            gifUrl: gifUrl,
            commentsCount: 0,
            imgVersion: '',
            imgId: '',
            createdAt: new Date(),
            reactions: {
                like: 0,
                love: 0,
                haha: 0,
                sad: 0,
                wow: 0,
                angry: 0
            }
        } as IPostDocument;

        socketIoPostObject.emit('add post', createdPost);

        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser!.userId}`,
            uId: `${req.currentUser!.uId}`,
            createdPost: createdPost
        } as ISavePostToCache);

        postQueue.addPostJob('addPostToDb', { key: req.currentUser!.userId, value: createdPost });

        res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully!' });
    }

    @joiValidation(postWithImageSchema)
    public async postWithImage(req: Request, res: Response): Promise<void> {
        const { post, bgColor, privacy, feelings, gifUrl, profilePicture, postImage } = req.body;

        const result: UploadApiResponse = await uploads(postImage) as UploadApiResponse;

        if (!result?.public_id) {
            throw new BadRequestError(result.message);
        }

        const postObjectId: ObjectId = new ObjectId();
        const createdPost: IPostDocument = {
            _id: postObjectId,
            userId: req.currentUser!.userId,
            username: req.currentUser!.username,
            email: req.currentUser!.email,
            avatarColor: req.currentUser!.avatarColor,
            profilePicture: profilePicture,
            post: post,
            bgColor: bgColor,
            feelings: feelings,
            privacy: privacy,
            gifUrl: gifUrl,
            commentsCount: 0,
            imgVersion: result.version.toString(),
            imgId: result!.public_id,
            createdAt: new Date(),
            reactions: {
                like: 0,
                love: 0,
                haha: 0,
                sad: 0,
                wow: 0,
                angry: 0
            }
        } as IPostDocument;

        socketIoPostObject.emit('add post with image', createdPost);

        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser!.userId}`,
            uId: `${req.currentUser!.uId}`,
            createdPost: createdPost
        } as ISavePostToCache);

        postQueue.addPostJob('addPostToDb', { key: req.currentUser!.userId, value: createdPost });

        res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully!' });
    }
}
