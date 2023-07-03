import { IFollower } from '@follower/interfaces/follower.interface';
import { Server, Socket } from 'socket.io';
import { ISenderReceiver } from '@chat/interfaces/chat.interface';
import { connectedUsersMap } from '@sockets/user';

export let socketIOChatObject: Server;

export class SocketIOChatHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        socketIOChatObject = io;
    }

    public listen() {
        this.io.on('connection', (socket: Socket) => {
            socket.on('join room', (users: ISenderReceiver) => {
                const { senderName, receiverName } = users;
                const senderSocketId: string = connectedUsersMap.get(senderName) as string;
                const receiverSocketId: string = connectedUsersMap.get(receiverName) as string;

                socket.join(senderSocketId);
                socket.join(receiverSocketId);
            });
        });
    }
}
