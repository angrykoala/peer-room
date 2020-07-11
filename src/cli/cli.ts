import * as io from "socket.io-client";
import { ClientPeer, ClientPeerEvents } from "./client_peer";
import SimplePeer from "simple-peer";
import { EventEmitter } from 'events';

export class SocketStremClient extends EventEmitter {
    private options: SocketStremClientOptions;
    private socket?: SocketIOClient.Socket;
    private peers: Map<string, ClientPeer> = new Map();

    constructor(options: SocketStremClientOptions) {
        super();
        this.options = options;
    }

    public async connect(): Promise<void> {
        const socket = io.connect(this.options.location);
        socket.on('connect', () => {
            this.socket = socket;
            console.log("[Socket] Connected");
        });

        socket.on('disconnect', () => {
            console.log("[Socket] Disconnected");
        });

        socket.on('add-peer', (peerData: { id: string }) => {
            console.log("[Socket] Add peer", peerData);
            this.setupPeer(peerData.id, true);
        });

        socket.on('peer-disconnected', (peerData: { id: string }) => {
            console.log("[Socket] Peer Disconnected");
            this.disconnectPeer(peerData.id);
        });

        socket.on('signal', ({ source, signal }: { source: string, signal: string | SimplePeer.SignalData }) => {
            let peer = this.peers.get(source);
            if (!peer) {
                peer = this.setupPeer(source, false);
            }

            peer.signal(signal);
            console.log("[Socket] Signal", source, signal);
        });
    }

    private disconnectPeer(id: string): void {
        const peer = this.peers.get(id);
        if (peer) {
            peer.disconnect();
            this.peers.delete(id);
        }
    }

    private setupPeer(id: string, initiator: boolean): ClientPeer {
        if (!this.socket) throw new Error();
        const peer = new ClientPeer(id, this.socket, {
            initiator
        });
        this.peers.set(peer.id, peer);

        // TODO: connected is may be received before other events
        // Try to queue all other events to be sent afterwards

        peer.on(ClientPeerEvents.connect, () => {
            this.emit('peer-connected', peer);
        });

        return peer;
    }
}

export type SocketStremClientOptions = {
    location: string,
    stream?: MediaStream
};
