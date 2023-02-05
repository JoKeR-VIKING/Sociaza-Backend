import dotenv from 'dotenv';
import process from 'process';
import bunyan from 'bunyan';

dotenv.config({});

export class Config {
    public static DATABASE_URL: string | undefined;
    public static JWT_TOKEN: string | undefined;
    public static NODE_ENV: string | undefined;
    public static SECRET_KEY_ONE: string | undefined;
    public static SECRET_KEY_TWO: string | undefined;
    public static CLIENT_URL: string | undefined;
    public static REDIS_HOST: string | undefined;

    constructor() {
        Config.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/sociaza-backend';
        Config.JWT_TOKEN = process.env.JWT_TOKEN || 'notsafe';
        Config.NODE_ENV = process.env.NODE_ENV || 'development';
        Config.SECRET_KEY_ONE = process.env.NODE_ENV || 'notsafe';
        Config.SECRET_KEY_TWO = process.env.NODE_ENV || 'notsafe';
        Config.CLIENT_URL = process.env.NODE_ENV || 'http://127.0.0.1:3000';
        Config.REDIS_HOST = process.env.REDIS_HOST || 'http://127.0.0.1:6379';
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
}
