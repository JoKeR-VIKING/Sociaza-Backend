import express, { Router, Request, Response } from 'express';
import moment from 'moment';
import axios from 'axios';
import { performance } from 'perf_hooks';
import HTTP_STATUS from 'http-status-codes';
import { Config } from '@root/config';
import process from "process";

export class Health {
    private router: Router;

    constructor () {
        this.router = express.Router();
    }

    public health(): Router {
        this.router.get('/health', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.OK).send(`Health: Server instance is healthy with pid ${process.pid} on ${moment().format('LL')}`);
        });

        return this.router;
    }

    public env(): Router {
        this.router.get('/env', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.OK).send(`This is the ${Config.NODE_ENV} environment`);
        });

        return this.router;
    }

    public instance(): Router {
        this.router.get('/instance', async (req: Request, res: Response) => {
            const response = await axios({
                method: "GET",
                url: Config.EC2_URL
            });

            res.status(HTTP_STATUS.OK).send(`Server is running on ec2 instance with id ${response.data} and process id ${process.pid} on ${moment().format('LL')}`);
        });

        return this.router;
    }

    public fibo(): Router {
        this.router.get('/fibo/:num', async (req: Request, res: Response) => {
            const start: number = performance.now();
            const result: number = this.fiboCalc(parseInt(req.params.num, 10));
            const end: number = performance.now();

            res.status(HTTP_STATUS.OK).send(`Fibonacci of ${req.params.num} is ${result} and it took ${end - start}ms with ec2 instance.`);
        });

        return this.router;
    }

    private fiboCalc(data: number): number {
        if (data < 2)
            return 1;

        return this.fiboCalc(data - 2) + this.fiboCalc(data - 1);
    }
}

export const healthRoutes: Health = new Health();