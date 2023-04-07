import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postQueue } from '@services/queues/post.queue';
import { imageQueue } from '@services/queues/image.queue';
import { PostCache } from '@services/redis/post.cache';
import { joiValidation } from '@globals/decorators/joiValidationDecorators';
import { postSchema, postWithImageSchema } from '@post/schemes/post.scheme';
import { socketIoPostObject } from '@sockets/post.socket';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@globals/helpers/cloudinaryUpload';
import { BadRequestError } from '@globals/helpers/errorHandler';


const postCache: PostCache = new PostCache();

export class UpdatePost {
    @joiValidation(postSchema)
    public async post(req: Request, res: Response): Promise<void> {
        const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
        const { postId } = req.params;
        const updatedPost: IPostDocument = {
            post,
            bgColor,
            privacy,
            feelings,
            gifUrl,
            profilePicture,
            imgId,
            imgVersion
        } as IPostDocument;

        const cachePost: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
        socketIoPostObject.emit('update post', cachePost, 'posts');
        postQueue.addPostJob('updatePostFromDb', { key: postId, value: cachePost });
        res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
    }

    @joiValidation(postWithImageSchema)
    public async postWithImage(req: Request, res: Response): Promise<void> {
        const { imgId, imageVersion } = req.body;

        if (imgId && imageVersion) {
            UpdatePost.prototype.updateImage(req, res);
        }
        else {
            const result: UploadApiResponse = await UpdatePost.prototype.addImage(req);
            if (!result.public_id)
                throw new BadRequestError(result.message);
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
    }

    private async addImage(req: Request): Promise<UploadApiResponse> {
        const { post, bgColor, feelings, privacy, gifUrl, profilePicture, postImage } = req.body;
        const { postId } = req.params;

        const result: UploadApiResponse = await uploads(postImage) as UploadApiResponse;
        if (!result!.public_id)
            return result;

        const updatedPost: IPostDocument = {
            post,
            bgColor,
            privacy,
            feelings,
            gifUrl,
            profilePicture,
            imgId: result.public_id,
            imgVersion: result.version.toString()
        } as IPostDocument;

        const cachePost: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
        socketIoPostObject.emit('update post', cachePost, 'posts');
        postQueue.addPostJob('updatePostFromDb', { key: postId, value: cachePost });

        imageQueue.addImageJob('addImageToDb', {
            key: req.currentUser!.userId,
            imgId: result.public_id,
            imgVersion: result.version.toString()
        });

        return result;
    }

    private async updateImage(req: Request, res: Response): Promise<void> {
        const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
        const { postId } = req.params;
        const updatedPost: IPostDocument = {
            post,
            bgColor,
            privacy,
            feelings,
            gifUrl,
            profilePicture,
            imgId,
            imgVersion
        } as IPostDocument;

        const cachePost: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
        socketIoPostObject.emit('update post', cachePost, 'posts');
        postQueue.addPostJob('updatePostFromDb', { key: postId, value: cachePost });
    }
}