import { Server, Socket } from 'socket.io';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { ISocketData } from '@user/interfaces/user.interface';

const log: Logger = Config.createLogger('userSocket');
export let socketIoUserObject: Server;

export class SocketIOUserHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        socketIoUserObject = io;
    }

    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on('block user', (data: ISocketData) => {
                this.io.emit('blocked user id', data);
            });

            socket.on('unblock user', (data: ISocketData) => {
                this.io.emit('unblocked user id', data);
            });
        });
    }
}