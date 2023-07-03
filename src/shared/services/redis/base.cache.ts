import { createClient } from 'redis';
import Logger from 'bunyan';
import { Config } from '@root/config';

export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
    client: RedisClient;
    log: Logger;

    constructor(cacheName: string) {
        this.client = createClient({ url: Config.REDIS_HOST });
        this.log = Config.createLogger(cacheName);
        this.cacheError();
    }

    private cacheError(): void {
        this.client.on('error', (err: unknown) => {
            this.log.error(err);
        });
    }
}
