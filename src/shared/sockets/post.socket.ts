import { Server, Socket } from 'socket.io';
import Logger from 'bunyan';
import { Config } from '@root/config';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { ICommentDocument } from '@comment/interfaces/comment.interface';

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
            socket.on('reaction', (reaction: IReactionDocument) => {
                this.io.emit('update like', reaction);
            });

            socket.on('comment', (data: ICommentDocument) => {
                this.io.emit('update comment', data);
            })
        });
    }
}