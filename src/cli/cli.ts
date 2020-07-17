import * as io from "socket.io-client";
import { ClientPeer, ClientPeerEvents } from "./client_peer";
import SimplePeer from "simple-peer";
import { EventEmitter } from 'events';
import { ConnectionRequestResponse, SocketEvents } from "../common/types";

export type SocketStreamClientOptions = {
    location?: string,
    room?: string
};

export class SocketStreamClient extends EventEmitter {
    private location: string;
    private socket?: SocketIOClient.Socket;
    private peers: Map<string, ClientPeer> = new Map();
    private iceServers?: Array<RTCIceServer>;

    constructor(options: SocketStreamClientOptions = {}) {
        super();
        this.location = `${options.location || document.location.host}/socketstream_${options.room || 'default'}`;
    }

    public async connect(payload?: any): Promise<void> {
        const socket = io.connect(this.location);
        socket.on('connect', () => {
            this.socket = socket;
            console.log("[Socket] Connected");
            this.socket.emit(SocketEvents.ConnectRequest, payload, (responseData: ConnectionRequestResponse) => {
                console.log("[Socket] Connection Accepted");
                if (responseData.iceServers) {
                    this.iceServers = responseData.iceServers;
                }
                this.emit('ready');
            });
        });

        socket.on('disconnect', () => {
            console.log("[Socket] Disconnected");
        });

        socket.on(SocketEvents.AddPeer, (peerData: { id: string }) => {
            console.log("[Socket] Add peer", peerData);
            this.setupPeer(peerData.id, true);
        });

        socket.on(SocketEvents.PeerDisconnected, (peerData: { id: string }) => {
            console.log("[Socket] Peer Disconnected");
            this.disconnectPeer(peerData.id);
        });

        socket.on(SocketEvents.Signal, ({ source, signal }: { source: string, signal: string | SimplePeer.SignalData }) => {
            let peer = this.peers.get(source);
            if (!peer) { // TODO: validate this is the first signal, and not a leftover from deleted peers
                peer = this.setupPeer(source, false);
            }

            peer.signal(signal);
            console.log("[Socket] Signal", source, signal);
        });
    }

    public onMessage(event: string, fn: Function): void {
        if (!this.socket) throw new Error();
        this.socket.on(event, fn);
    }

    public send(event: string, payload?: any): void {
        if (!this.socket) throw new Error();
        this.socket.emit(event, payload);
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
            initiator,
            config: {
                iceServers: this.iceServers
            }
        });
        this.peers.set(peer.id, peer);

        peer.on(ClientPeerEvents.connect, () => {
            this.emit('peer-connected', peer);
        });

        return peer;
    }
}
