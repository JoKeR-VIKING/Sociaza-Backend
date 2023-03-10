import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { createBullBoard } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob } from '@user/interfaces/user.interface';
import { IPostJobData } from '@post/interfaces/post.interface';

let bullAdapters: BullAdapter[] = [];

type IBaseJobData = IAuthJob | IEmailJob | IPostJobData;

export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
    queue: Queue.Queue;
    log: Logger;

    constructor(queueName: string) {
        this.queue = new Queue(queueName, `${Config.REDIS_HOST}`);
        bullAdapters.push(new BullAdapter(this.queue));
        bullAdapters = [...new Set(bullAdapters)];
        serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/queues');

        createBullBoard({
            queues: bullAdapters,
            serverAdapter: serverAdapter
        });

        this.log = Config.createLogger(`${queueName}Queue`);

        this.queue.on('completed', (job: Job) => {
            job.remove();
        });

        this.queue.on('global:completed', (jobId: string) => {
            this.log.info(`Job ${jobId} is completed.`);
        });

        this.queue.on('global:stalled', (jobId: string) => {
            this.log.warn(`Job ${jobId} is stalled.`);
        });
    }

    protected addJob(name: string, data: IBaseJobData): void {
        this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
    };

    protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
        this.queue.process(name, concurrency, callback);
    };
}