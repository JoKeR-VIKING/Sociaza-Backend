import { createClient } from 'redis';
import Logger from 'bunyan';
import { Config } from '@root/config';

export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
    client: RedisClient;
    log: Logger;

    constructor(cacheName: string) {
        this.client = createClient({
            password: Config.REDIS_PASSWORD,
            socket: {
                host: Config.REDIS_HOST,
                port: 11874
            }
        });
        this.log = Config.createLogger(cacheName);
        this.cacheError();
    }

    private cacheError(): void {
        this.client.on('error', (err: unknown) => {
            this.log.error(err);
        });
    }
}
