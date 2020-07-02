import http from 'http';
import { EventEmitter } from 'events';
import SocketIO, { Socket } from 'socket.io';
import { Peer } from './peer';


type SignalEvent = {
    target: string
    signal: any
}

export class SocketStreamRoom extends EventEmitter {
    private peers: Map<string, Peer> = new Map();
    private io: SocketIO.Server;

    constructor(httpServer: http.Server) {
        super()
        this.io = SocketIO(httpServer);
        this.io.origins('*:*');

        this.setupSocketConnections();
    }

    public registerPeer(peer: Peer) {
        this.notify('add-peer', peer.serialize());
        this.peers.set(peer.id, peer);
    }

    private setupSocketConnections() {
        this.io.on('connection', (socket: Socket) => {
            const peer = new Peer(socket);
            this.emit('connection', peer);

            socket.on('disconnect', () => {
                console.log("Disconnect");
                this.emit('disconnect', peer);
            })

            socket.on('signal', ({ target, signal }: SignalEvent) => {
                console.log("Signal")
                // TODO: validate signal
                const targetPeer = this.peers.get(target);
                if (targetPeer) targetPeer.emit('signal', {
                    source: socket.id,
                    signal
                });
            });
        });
    }

    private notify(event: string, data?: any) {
        for (const [_id, peer] of this.peers) {
            peer.emit(event, data);
        }
    }
}
