import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { PostCache } from '@services/redis/post.cache';
import { postQueue } from '@services/queues/post.queue';
import { socketIoPostObject } from '@sockets/post.socket';

const postCache: PostCache = new PostCache();

export class DeletePost {
    public async post(req: Request, res: Response): Promise<void> {
        socketIoPostObject.emit('delete post', req.params.postId);
        await postCache.deletePostFromCache(req.params.postId, `${req.currentUser!.userId}`);
        postQueue.addPostJob('deletePostFromDb', { keyOne: req.params.postId, keyTwo: req.currentUser!.userId });
        res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
    }
}
