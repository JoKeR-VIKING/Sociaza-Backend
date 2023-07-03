import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@services/redis/post.cache';
import { postService } from '@services/db/post.service';

const postCache: PostCache = new PostCache();
const PAGE_SIZE = 10;

export class GetPost {
    public async post(req: Request, res: Response): Promise<void> {
        const { page } = req.params;
        const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
        const limit: number = parseInt(page) * PAGE_SIZE;
        const newSkip: number = skip === 0 ? skip : skip + 1;
        let posts: IPostDocument[] = [];

        let totalPosts = 0;

        const cachedPosts:IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit);

        if (cachedPosts.length) {
            posts = cachedPosts;
            totalPosts = await postCache.getTotalPostsFromCache();
        }
        else {
            posts = await postService.getPosts({}, skip, limit, { created_at: -1 });
            totalPosts = await postService.postCount();
        }

        res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPosts });
    }

    public async postWithImage(req: Request, res: Response): Promise<void> {
        const { page } = req.params;
        const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
        const limit: number = parseInt(page) * PAGE_SIZE;
        const newSkip: number = skip === 0 ? skip : skip + 1;
        let posts: IPostDocument[] = [];

        const cachedPosts:IPostDocument[] = await postCache.getPostsWithImageFromCache('post', newSkip, limit);

        posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });
        res.status(HTTP_STATUS.OK).json({ message: 'All posts with image', posts });
    }

    public async postWithVideo(req: Request, res: Response): Promise<void> {
        const { page } = req.params;
        const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
        const limit: number = parseInt(page) * PAGE_SIZE;
        const newSkip: number = skip === 0 ? skip : skip + 1;
        let posts: IPostDocument[] = [];

        const cachedPosts:IPostDocument[] = await postCache.getPostsWithVideoFromCache('post', newSkip, limit);

        posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ videoId: '$ne' }, skip, limit, { createdAt: -1 });
        res.status(HTTP_STATUS.OK).json({ message: 'All posts with video', posts });
    }
}