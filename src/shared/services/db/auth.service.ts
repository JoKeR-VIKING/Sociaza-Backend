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

    public async createAuthUser(data: IAuthDocument): Promise<void> {
        await AuthModel.create(data);
    }
}

export const authService: AuthService = new AuthService();