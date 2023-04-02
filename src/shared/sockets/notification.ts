import { Server, Socket } from 'socket.io';
import Logger from 'bunyan';
import { Config } from '@root/config';

const log: Logger = Config.createLogger('notificationSocket');
export let socketIoNotificationObject: Server;

export class SocketIONotificationHandler {
    public listen(io: Server): void {
        socketIoNotificationObject = io;
    }
}