import { createClient } from 'redis';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';

const log: Logger = Config.createLogger('redis_connection');

class RedisConnection extends BaseCache {
    constructor() {
        super('redis_connection');
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
            const res = this.client.ping();
        }
        catch (err) {
            log.error(err);
        }
    }
}

export const redisConnection: RedisConnection = new RedisConnection();