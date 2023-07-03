import { Server, Socket } from 'socket.io';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { IFollower } from '@follower/interfaces/follower.interface';

const log: Logger = Config.createLogger('followerSocket');
export let socketIoFollowerObject: Server;

export class SocketIOFollowerHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        socketIoFollowerObject = io;
    }

    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on('unfollow user', (data: IFollower) => {
                this.io.emit('remove follower', data);
            });
        });
    }
}