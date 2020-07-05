import http from 'http';
import { EventEmitter } from 'events';
import SocketIO, { Socket } from 'socket.io';
import { Peer } from './peer';

type SignalEvent = {
    target: string
    signal: any
};

export class SocketStreamRoom extends EventEmitter {
    private peers: Map<string, Peer> = new Map();
    private io: SocketIO.Server;

    constructor(httpServer: http.Server) {
        super();
        this.io = SocketIO(httpServer);
        this.io.origins('*:*');

        this.setupSockets();
    }

    public registerPeer(peer: Peer): void {
        this.notify('add-peer', peer.serialize());
        this.peers.set(peer.id, peer);
    }

    public isPeerRegistered(peer: Peer): boolean {
        return this.peers.has(peer.id);
    }

    private setupSockets(): void {
        this.io.on('connection', (socket: Socket) => {
            const peer = new Peer(socket);
            this.emit('connection', peer);

            socket.on('disconnect', () => {
                if (this.isPeerRegistered(peer)) {
                    console.log("Disconnect");
                    this.emit('disconnect', peer);
                    this.peers.delete(peer.id);
                    this.notify('peer-disconnected', peer.serialize());
                }
            });

            socket.on('signal', ({ target, signal }: SignalEvent) => {
                console.log("Signal");
                if (this.isPeerRegistered(peer)) {
                    // TODO: validate signal
                    const targetPeer = this.peers.get(target);
                    if (targetPeer) targetPeer.emit('signal', {
                        source: socket.id,
                        signal
                    });
                }
            });
        });
    }

    private notify(event: string, data?: any): void {
        for (const [_id, peer] of this.peers) {
            peer.emit(event, data);
        }
    }
}
