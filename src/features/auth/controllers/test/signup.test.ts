import { Request, Response } from 'express';
import * as cloudinaryUploads from '@globals/helpers/cloudinaryUpload';
import { authMockRequest } from '@root/mocks/auth.mocks';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queue/user.queue');
jest.mock('@service/queue/auth.queue');
jest.mock('@globals/helpers/cloudinaryUpload');

describe('SignUp', () => {
    it ('should throw an error if username is not avaialable', () => {
        const req: Request = authMockRequest({}, {
            username: '',
            email: 'manny@test.com',
            password: 'qwerty',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        }) as unknown as Request;
    });
});
