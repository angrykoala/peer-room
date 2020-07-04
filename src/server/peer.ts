import { Socket } from 'socket.io';

export type SerializedPeer = {
    id: string
};

export class Peer {
    private socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    public get id(): string {
        return this.socket.id;
    }

    public emit(event: string, data?: any): void {
        this.socket.emit(event, data);
    }

    public serialize(): SerializedPeer {
        return {
            id: this.id
        };
    }
}
