import { IFollower } from '@follower/interfaces/follower.interface';
import { Server, Socket } from 'socket.io';
import { ISenderReceiver } from '@chat/interfaces/chat.interface';

export let socketIOChatObject: Server;

export class SocketIOChatHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        socketIOChatObject = io;
    }

    public listen() {
        this.io.on('connection', (socket: Socket) => {
            socket.on('join room', (data: ISenderReceiver) => {
                console.log(data);
            })
        });
    }
}