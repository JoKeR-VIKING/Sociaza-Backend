import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export function uploads(file: string, publicId?: string, overwrite?: boolean, invalidate?: boolean): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
    return new Promise(resolve => {
        cloudinary.v2.uploader.upload(file, {
            public_id: publicId,
            overwrite: overwrite,
            invalidate: invalidate
        },
        (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (err)
            {
                console.log(err);
                resolve(err);
            }

            resolve(result);
        });
    });
}
