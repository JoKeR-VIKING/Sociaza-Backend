import { Server, Socket } from 'socket.io';
import Logger from 'bunyan';
import { Config } from '@root/config';

const log: Logger = Config.createLogger('imageSocket');
export let socketIoImageObject: Server;

export class SocketIOImageHandler {
    public listen(io: Server): void {
        socketIoImageObject = io;
    }
}