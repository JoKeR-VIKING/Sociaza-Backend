import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import { Config } from '@root/config';
import applicationRoutes from '@root/routes';
import { BadRequestError, NotFoundError, FileTooLargeError, JoiRequestValidationError, IErrorResponse, CustomError } from '@globals/helpers/errorHandler';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import Logger from 'bunyan';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import 'express-async-errors';
import { SocketIOPostHandler } from '@sockets/post.socket';
import { SocketIOUserHandler } from '@sockets/user';
import { SocketIOFollowerHandler } from '@sockets/follower';
import { SocketIONotificationHandler } from '@sockets/notification';
import { SocketIOImageHandler } from '@sockets/image';
import { SocketIOChatHandler } from '@sockets/chat';
import apiStats from 'swagger-stats';

const SERVER_PORT = 8000;
const log: Logger = Config.createLogger('server');

export class SociazaServer {
    private readonly app: Application;

    constructor (app: Application) {
        this.app = app;
    }

    private securityMiddleware(app: Application): void {
        app.use(
            cookieSession ({
                name: 'session',
                keys: [Config.SECRET_KEY_ONE!, Config.SECRET_KEY_TWO!],
                maxAge: 24 * 36000 * 1000,
                secure: true,
                sameSite: "none"
            })
        );

        app.set("trust proxy", 1);

        app.use(hpp());
        app.use(helmet());

        app.use(
            cors ({
                origin: Config.CLIENT_URL,
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            })
        );
    };

    private standardMiddleware(app: Application): void {
        app.use(compression());
        app.use(json({limit: '50mb',}));
        app.use(urlencoded({extended: true, limit: '50mb',}));
    };

    private routeMiddleware(app: Application): void {
        applicationRoutes(app);
    };

    private apiMonitoring(app: Application): void {
        app.use(apiStats.getMiddleware({
            uriPath: '/api-monitoring'
        }));
    }

    private globalErrorMiddleware(app: Application): void {
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                message: `${req.originalUrl} not found`,
            });
        });

        app.use((err: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
            log.error(err);
            if (err instanceof CustomError) {
                return res.status(err.code).json(err.serializeErrors());
            }
            next();
        });
    };

    private async startServer(app: Application): Promise<void> {
        if (!Config.JWT_TOKEN) {
            throw new Error('JWT token must be provided');
        }

        try {
            const httpServer: http.Server = new http.Server(app);
            const socketIO: Server = await this.createSocketIO(httpServer);
            this.socketIOConnections(socketIO);
            this.startHttpServer(httpServer);
        }
        catch (err) {
            log.error(err);
        }
    };

    private async createSocketIO(httpServer: http.Server): Promise<Server> {
        const io: Server = new Server(httpServer, {
            cors: {
                origin: Config.CLIENT_URL,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            }
        });

        const pubClient = createClient({
            url: Config.REDIS_HOST
        });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);

        io.adapter(createAdapter(pubClient, subClient));

        return io;
    };

    private startHttpServer(httpServer: http.Server): void {
        log.info(`Worker with process id of ${process.pid} has started`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Server running on port ${SERVER_PORT}`);
        })
    };

    private socketIOConnections(io: Server): void {
        const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
        const followerSocketHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler(io);
        const userSocketHandler: SocketIOUserHandler = new SocketIOUserHandler(io);
        const notificationSocketHandler: SocketIONotificationHandler = new SocketIONotificationHandler();
        const imageSocketHandler: SocketIOImageHandler = new SocketIOImageHandler();
        const chatSocketHandler: SocketIOChatHandler = new SocketIOChatHandler(io);

        postSocketHandler.listen();
        followerSocketHandler.listen();
        userSocketHandler.listen();
        notificationSocketHandler.listen(io);
        imageSocketHandler.listen(io);
        chatSocketHandler.listen();
    };

    public start() : void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.apiMonitoring(this.app);
        this.globalErrorMiddleware(this.app);
        this.startServer(this.app);
    };
}