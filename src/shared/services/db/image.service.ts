import mongoose from 'mongoose';
import { UserModel } from '@user/models/user.schema';
import { ImageModel } from '@image/models/image.schema';
import {IFileImageDocument} from "@root/features/images/interfaces/image.interface";

class ImageService {
    public async addUserProfileImageToDb(userId: string, url: string, imgId: string, imgVersion: string): Promise<void> {
        await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
        await this.addImage(userId, imgId, imgVersion, 'profile');
    }

    public async addBackgroundImageToDb(userId: string, imgId: string, imgVersion: string): Promise<void> {
        await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }).exec();
        await this.addImage(userId, imgId, imgVersion, 'background');
    }

    public async updateBackgroundImageToDb(userId: string, imgId: string, imgVersion: string): Promise<void> {
        await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }).exec();
    }

    public async removeImage(imgId: string): Promise<void> {
        await ImageModel.deleteOne({ _id: imgId }).exec();
    }

    public async getImageByBackgroundId(bgImageId: string): Promise<IFileImageDocument> {
        return await ImageModel.findOne({ bgImageId: bgImageId }).exec() as IFileImageDocument;
    }

    public async getImages(userId: string): Promise<IFileImageDocument[]> {
        return await ImageModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } }
        ]) as IFileImageDocument[];
    }

    public async addImage(userId: string, imgId: string, imgVersion: string, type: string): Promise<void> {
        await ImageModel.create({
            userId: userId,
            bgImageVersion: imgVersion,
            bgImageId: imgId,
            imgVersion: imgVersion,
            imgId: imgId
        });
    }
}

export const imageService: ImageService = new ImageService();