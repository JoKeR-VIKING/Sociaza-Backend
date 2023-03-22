import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentModel } from '@comment/models/comment.schema';
import { Query } from 'mongoose';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

const userCache: UserCache = new UserCache();

class CommentService {
    public async addCommentToDb(data: ICommentJob): Promise<void> {
        const { postId, userTo, userFrom, comment, username } = data;
        const comments: Promise<ICommentDocument> = CommentModel.create(comment);
        const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
            { _id: postId },
            { $inc: { commentsCount: 1 } },
            { new: true }
        ) as Query<IPostDocument, IPostDocument>;

        const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;

        await Promise.all([comments, post, user]);

        // sends comments notification
    }

    public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
        return CommentModel.aggregate([
            { $match: query },
            { $sort: sort }
        ]);
    }

    public async getPostCommentNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
        return CommentModel.aggregate([
            { $match: query },
            { $sort: sort },
            { $group: { _id: null, names: { $addToSet: 'username' }, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ]);
    }
}

export const commentService: CommentService = new CommentService();