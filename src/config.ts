import dotenv from 'dotenv';
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';
import process from "process";

dotenv.config({});
export class Config {
    public static DATABASE_URL: string | undefined;
    public static JWT_TOKEN: string | undefined;
    public static NODE_ENV: string | undefined;
    public static SECRET_KEY_ONE: string | undefined;
    public static SECRET_KEY_TWO: string | undefined;
    public static CLIENT_URL: string | undefined;
    public static REDIS_PASSWORD: string | undefined;
    public static REDIS_HOST: string | undefined;
    public static CLOUD_NAME: string | undefined;
    public static CLOUD_API_KEY: string | undefined;
    public static CLOUD_API_SECRET: string | undefined;
    public static SENDER_EMAIL: string | undefined;
    public static SENDER_PASSWORD: string | undefined;
    public static SENDGRID_API_KEY: string | undefined;
    public static SENDGRID_SENDER: string | undefined;
    public static EC2_URL: string | undefined;

    constructor() {
        Config.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/sociaza-backend';
        Config.JWT_TOKEN = process.env.JWT_TOKEN || '';
        Config.NODE_ENV = process.env.NODE_ENV || '';
        Config.SECRET_KEY_ONE = process.env.NODE_ENV || '';
        Config.SECRET_KEY_TWO = process.env.NODE_ENV || '';
        Config.CLIENT_URL = process.env.CLIENT_URL || '';
        Config.REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
        Config.REDIS_HOST = process.env.REDIS_HOST || '';
        Config.CLOUD_NAME = process.env.CLOUD_NAME || '';
        Config.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
        Config.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || '';
        Config.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
        Config.SENDER_PASSWORD = process.env.SENDER_PASSWORD || '';
        Config.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
        Config.SENDGRID_SENDER = process.env.SENDGRID_SENDER || '';
        Config.EC2_URL = process.env.EC2_URL || '';
    }

    public static createLogger(name: string): bunyan {
        return bunyan.createLogger({
            name: name,
            level: 'debug',
        });
    }

    public static validateConfig(): void {
        new Config();
        for (const [key, value] of Object.entries(this)) {
            if (value === undefined)
                throw new Error(`Config validation failed for ${key}`);
        }
    }

    public static cloudinaryConfig(): void {
        cloudinary.v2.config({
            cloud_name: Config.CLOUD_NAME,
            api_key: Config.CLOUD_API_KEY,
            api_secret: Config.CLOUD_API_SECRET,
        });
    }
}