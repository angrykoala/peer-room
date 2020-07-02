import * as io from "socket.io-client";
import { ClientPeer } from "./src/cli/client_peer";
import SimplePeer from "simple-peer";
import { EventEmitter } from 'events';

export class SocketStremClient extends EventEmitter {
    private options: SocketStremClientOptions;
    private socket?: SocketIOClient.Socket;
    private peers: Map<string, ClientPeer> = new Map();

    constructor(options: SocketStremClientOptions) {
        super()
        this.options = options;
    }

    async connect(): Promise<void> {
        const socket = io.connect(this.options.location);
        socket.on('connect', () => {
            this.socket = socket
            console.log("Connected")
        });
        socket.on('add-peer', (peerData: { id: string }) => {
            console.log("Add peer", peerData)
            this.setupPeer(peerData.id, true);


        });
        socket.on('peer-disconnected', (peerData: { id: string }) => {
            console.log("Peer Disconnected")
            this.disconnectPeer(peerData.id)
        });

        socket.on('signal', ({ source, signal }: { source: string, signal: string | SimplePeer.SignalData }) => {
            let peer = this.peers.get(source);
            if (!peer) {
                peer = this.setupPeer(source, false);
            }

            peer.signal(signal)
            console.log("Signal", signal)
        });
        socket.on('connect-to-peer', () => {

        })
    }

    private disconnectPeer(id: string) {
        let peer = this.peers.get(id);
        if (peer) {
            peer.disconnect();
            this.peers.delete(id);
        }
    }

    private setupPeer(id: string, initiator: boolean): ClientPeer {
        if (!this.socket) throw new Error()
        const peer = new ClientPeer(id, this.socket, {
            initiator
        })
        this.peers.set(peer.id, peer)

        peer.on('connected', () => {
            this.emit('peer-connected', peer)
        })

        return peer;
    }
}


export type SocketStremClientOptions = {
    location: string,
    stream?: MediaStream
}
