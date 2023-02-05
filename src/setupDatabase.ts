import mongoose from 'mongoose';
import process from 'process';
import { Config } from './config';
import Logger from 'bunyan';

const log: Logger = Config.createLogger('database');

export default () => {
    const connect = () => {
        mongoose.set('strictQuery', true);
        mongoose.connect(Config.DATABASE_URL!)
            .then(() => {
                log.info('Successfully connected to database');
            })
            .catch((err) => {
                log.error(err);
                return process.exit(1);
            })
    }

    connect();
    mongoose.connection.on('disconnected', connect);
}