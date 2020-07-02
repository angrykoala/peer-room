import SimplePeer from 'simple-peer';
import { EventEmitter } from 'events';

export enum ClientPeerEvents {
    disconnect = 'disconnect',
    connect = 'connect',
    stream = 'stream',
}

export class ClientPeer extends EventEmitter {
    public readonly id: string;
    private socket: SocketIOClient.Socket;
    private peer: SimplePeer.Instance;

    private peerConnected: boolean = false;

    constructor(id: string, socket: SocketIOClient.Socket, options: SimplePeer.Options) {
        super();
        this.id = id;
        this.peer = this.setupPeer(options);
        this.socket = socket;
    }

    public get connected(): boolean {
        return this.peerConnected;
    }

    public signal(signal: string | SimplePeer.SignalData): void {
        this.peer.signal(signal);
    }

    public sendData(data: string): void {
        this.peer.send(data);
    }

    public stream(stream: MediaStream): void {
        this.peer.addStream(stream);
    }

    public disconnect(): void {
        this.peer.destroy();
    }

    private setupPeer(options: SimplePeer.Options): SimplePeer.Instance {
        const peer = new SimplePeer(options);
        peer.on('signal', signal => {
            this.socket.emit('signal', {
                signal: signal,
                target: this.id
            });
        });

        peer.on('close', () => {
            console.log("Peer close");
            this.peerConnected = false;
            this.emit(ClientPeerEvents.disconnect);
        });
        peer.on('connect', () => {
            console.log("Peer connect");
            this.peerConnected = true;
            this.emit(ClientPeerEvents.connect);
        });
        peer.on('data', (data) => {
            console.log("Peer data", data);
        });
        peer.on('stream', (stream) => {
            console.log("Peer stream");
            this.emit(ClientPeerEvents.stream, stream);
        });
        peer.on('error', (error: Error) => {
            console.log("Peer error", error);
            this.peerConnected = false;
            this.emit(ClientPeerEvents.disconnect);
        });
        return peer;
    }
}
