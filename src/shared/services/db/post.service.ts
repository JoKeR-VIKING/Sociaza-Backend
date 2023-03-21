import { IGetPostsQuery, IPostDocument, IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Helpers } from '@globals/helpers/helpers';
import { PostModel } from '@post/models/post.schema';
import { UserModel } from '@user/models/user.schema';
import { Query, UpdateQuery } from 'mongoose';
import {BadRequestError} from "@globals/helpers/errorHandler";

class PostService {
    public async createPost(userId: string, data: IPostDocument): Promise<void> {
        const post: Promise<IPostDocument> = PostModel.create(data);
        const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });

        await Promise.all([post, user]);
    }

    public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
        let postQuery = {}

        if (query!.imgId || query!.gifUrl) {
            postQuery = {
                $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }],
            }
        }
        else {
            postQuery = query;
        }

        return await PostModel.aggregate([
            { $match: postQuery },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit }
        ]) as IPostDocument[];
    }

    public async deletePost(postId: string, userId: string): Promise<void> {
        const post: IPostDocument = await PostModel.findOne({ _id: postId }) as IPostDocument;
        if (!post)
            throw new BadRequestError('No such post exists!');

        const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
        // const deleteReaction
        const decerementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
        await Promise.all([deletePost, decerementPostCount]);
    }

    public async updatePost(postId: string, updatedPost: IPostDocument): Promise<void> {
        const post: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
        await Promise.all([post]);
    }

    public async postCount(): Promise<number> {
        return PostModel.find({}).countDocuments();
    }
}

export const postService: PostService = new PostService();