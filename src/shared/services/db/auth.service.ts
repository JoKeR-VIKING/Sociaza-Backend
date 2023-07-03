import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { Helpers } from '@globals/helpers/helpers';
import { AuthModel } from '@auth/models/auth.schema';

class AuthService {
    public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
        const query = {
            $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowercase(email) }]
        };

        return await AuthModel.findOne(query).exec() as IAuthDocument;
    }

    public async getUserByUsername(username: string): Promise<IAuthDocument> {
        const query = {
            username: Helpers.firstLetterUppercase(username)
        };

        return await AuthModel.findOne(query).exec() as IAuthDocument;
    }

    public async getUserByEmail(email: string): Promise<IAuthDocument> {
        const query = {
            email: Helpers.lowercase(email)
        }

        return await AuthModel.findOne(query).exec() as IAuthDocument;
    }

    public async getUserByPasswordToken(token: string): Promise<IAuthDocument> {
        const query = {
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        }

        return await AuthModel.findOne(query).exec() as IAuthDocument;
    }

    public async createAuthUser(data: IAuthDocument): Promise<void> {
        await AuthModel.create(data);
    }

    public async updateAuthUser(authId: string, token: string, tokenExpiration: number): Promise<void> {
        await AuthModel.updateOne({ _id: authId }, {
            passwordResetToken: token,
            passwordResetExpires: tokenExpiration,
        });
    }
}

export const authService: AuthService = new AuthService();