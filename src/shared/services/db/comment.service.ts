import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentModel } from '@comment/models/comment.schema';
import { NotificationModel } from '@notification/models/notification.schema';
import { PostModel } from '@post/models/post.schema';
import { Query } from 'mongoose';
import { UserCache } from '@services/redis/user.cache';
import { IPostDocument } from '@post/interfaces/post.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { INotificationDocument } from '@notification/interface/notification.interface';
import mongoose from 'mongoose';
import { socketIoNotificationObject } from '@sockets/notification';
import { notificationTemplate } from '@services/emails/templates/notifications/notification.template';
import { emailQueue } from '@services/queues/email.queue';

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
        const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, user]);

        if (response[2].notifications.comments && userFrom != userTo) {
            const notificationModel: INotificationDocument = new NotificationModel();
            const notification = await notificationModel.insertNotification({
                userTo: userTo,
                userFrom: userFrom,
                message: `${userFrom} has commented on your post`,
                comment: comment.comment,
                notificationType: 'comment',
                entityId: new mongoose.Types.ObjectId(postId),
                createdItemId: new mongoose.Types.ObjectId(response[0]._id),
                createdAt: new Date(),
                post: response[1].post,
                imgId: response[1].imgId!,
                imgVersion: response[1].imgVersion!,
                gifUrl: response[1].gifUrl!,
                reaction: ''
            });

            socketIoNotificationObject.emit('insert notification', notification, { userTo });

            const template: string = notificationTemplate.template({
                username: response[2].username!,
                message: `${username} has commented on your post`,
                header: 'Comment Notification'
            });

            emailQueue.addEmailJob('commentEmail', { receiverEmail: response[2].email!, subject: 'Sociaza post notification', template: template });
        }
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