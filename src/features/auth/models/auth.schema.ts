import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { model, Model, Schema } from 'mongoose';
import { hash, compare } from 'bcryptjs';

const SALT_ROUND = 10;

const authSchema: Schema = new Schema(
    {
        username: { type: String },
        uId: { type: String },
        email: { type: String },
        password: { type: String },
        avatarColor: { type: String },
        createdAt: { type: Date }
    },
    {
        toJSON: {
            transform(_doc, ret) {
                delete ret.password;
                return ret;
            }
        }
    }
);

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
    this.password = await hash(this.password!, SALT_ROUND);
    next();
});

authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    const hashedPassword: string = this.password!;
    return compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
    return hash(password, SALT_ROUND);
};

export const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth');