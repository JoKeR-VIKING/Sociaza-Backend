import { Server, Socket } from 'socket.io';
import Logger from 'bunyan';
import { Config } from '@root/config';

const log: Logger = Config.createLogger('postSocket');
export let socketIoPostObject: Server;

export class SocketIOPostHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        socketIoPostObject = io;
    }

    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            log.info('Post socketIo handler');
        });
    }
}