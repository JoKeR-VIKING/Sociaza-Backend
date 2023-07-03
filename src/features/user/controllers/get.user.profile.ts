import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import {IAllUsers, IUserDocument} from "@user/interfaces/user.interface";
import {UserCache} from "@services/redis/user.cache";
import {FollowerCache} from "@services/redis/follower.cache";
import {userService} from "@services/db/user.service";
import {IFollowerData, IFollowerDocument} from "@follower/interfaces/follower.interface";
import {followerService} from "@services/db/follower.service";
import mongoose from "mongoose";
import {Helpers} from "@globals/helpers/helpers";
import {IPostDocument} from "@post/interfaces/post.interface";
import {PostCache} from "@services/redis/post.cache";
import {postService} from "@services/db/post.service";

const PAGE_SIZE = 12;

interface IUserAll {
    newSkip: number,
    limit: number,
    skip: number,
    userId: string
}

const userCache: UserCache = new UserCache();
const followerCache: FollowerCache = new FollowerCache();
const postCache: PostCache = new PostCache();

export class GetUserProfile {
    public async all(req: Request, res: Response): Promise<void> {
        const { page } = req.params;
        const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
        const limit: number = PAGE_SIZE * parseInt(page);
        const newSkip: number = skip === 0 ? skip : skip + 1;

        const allUsers = await GetUserProfile.prototype.allUsers({
            newSkip,
            limit,
            skip,
            userId: `${req.currentUser!.userId}`
        });

        const followers: IFollowerData[] = await GetUserProfile.prototype.followers(`${req.currentUser!.userId}`);

        res.status(HTTP_STATUS.OK).json({ message: 'All users', users: allUsers.users, totalUsers: allUsers.totalUsers, followers: followers });
    }

    public async profile(req: Request, res: Response): Promise<void> {
        const cachedUser: IUserDocument = await userCache.getUserFromCache(`${req.currentUser!.userId}`) as IUserDocument;
        const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserByUserId(req.currentUser!.userId) as IUserDocument;

        res.status(HTTP_STATUS.OK).json({ message: 'User profile', existingUser });
    }

    public async profileById(req: Request, res: Response): Promise<void> {
        const { userId } = req.params;
        const cachedUser: IUserDocument = await userCache.getUserFromCache(userId) as IUserDocument;
        const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserByUserId(userId) as IUserDocument;

        res.status(HTTP_STATUS.OK).json({ message: 'User profile by id', existingUser });
    }

    public async profileAndPosts(req: Request, res: Response): Promise<void> {
        const { userId, username, uId } = req.params;
        const userName: string = Helpers.firstLetterUppercase(username);

        const cachedUser: IUserDocument = await userCache.getUserFromCache(userId) as IUserDocument;
        const cachedUserPosts: IPostDocument[] = await postCache.getUserPostsFromCache('post', parseInt(uId, 10)) as IPostDocument[];

        const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserByUserId(userId) as IUserDocument;
        const existingUserPosts: IPostDocument[] = cachedUserPosts ? cachedUserPosts : await postService.getPosts({ username: userName }, 0, 100, { createdAt: -1 }) as IPostDocument[];

        res.status(HTTP_STATUS.OK).json({ message: 'Get user profile and posts', user: existingUser, posts: existingUserPosts });
    }

    public async randomUserSuggestions(req: Request, res: Response): Promise<void> {
        let randomUsers: IUserDocument[] = [];
        const cachedUsers: IUserDocument[] = await userCache.getRandomUsersFromCache(`${req.currentUser!.userId}`, req.currentUser!.username);
        if (cachedUsers.length) {
            randomUsers = [...cachedUsers]
        }
        else {
            randomUsers = [...await userService.getRandomUsers(req.currentUser!.userId)];
        }

        res.status(HTTP_STATUS.OK).json({ message: 'Random users', users: randomUsers });
    }

    private async allUsers({ newSkip, limit, skip, userId }: IUserAll): Promise<IAllUsers> {
        let users = [];
        let type = '';

        const cachedUsers: IUserDocument[] = await userCache.getUsersFromCache(newSkip, limit, userId) as IUserDocument[];

        if (cachedUsers.length) {
            type = 'redis';
            users = cachedUsers;
        }
        else {
            type = 'mongodb';
            users = await userService.getAllUsers(userId, skip, limit);
        }

        const totalUsers: number = await GetUserProfile.prototype.usersCount(type);
        return { users, totalUsers };
    }

    private async usersCount(type: string): Promise<number> {
        if (type === 'redis') {
            return userCache.getTotalUsersInCache();
        }
        else {
            return userService.getTotalUsersInDb();
        }
    }

    private async followers(userId: string): Promise<IFollowerData[]> {
        const cachedFollowers: IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${userId}`);
        return cachedFollowers.length ? cachedFollowers : await followerService.getFolloweeData(new mongoose.Types.ObjectId(userId));
    }
}
