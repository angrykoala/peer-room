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
        this.peer = this.setupPeer({ trickle: true, ...options });
        this.socket = socket;
    }

    public get connected(): boolean {
        return this.peerConnected;
    }

    public signal(signal: string | SimplePeer.SignalData): void {
        this.peer.signal(signal);
    }

    public sendData(data: string): void {
        if (!this.connected) throw new Error("Cannot sendData before peer connected");
        this.peer.send(data);
    }

    public stream(stream: MediaStream): void {
        if (!this.connected) throw new Error("Cannot stream before peer connected");
        this.peer.addStream(stream);
    }

    public disconnect(): void {
        this.peerConnected = false;
        this.peer.destroy();
    }

    private setupPeer(options: SimplePeer.Options): SimplePeer.Instance {
        const peer = new SimplePeer(options);
        peer.on('signal', signal => {
            console.log("[Webrtc] Signal");
            this.socket.emit('signal', {
                signal: signal,
                target: this.id
            });
        });

        peer.on('close', () => {
            console.log("[Webrtc] Close");
            this.peerConnected = false;
            this.emit(ClientPeerEvents.disconnect);
        });
        peer.on('connect', () => {
            console.log("[Webrtc] Connect");
            this.peerConnected = true;
            this.emit(ClientPeerEvents.connect);
        });

        peer.on('data', (data) => {
            if (!this.connected) console.warn("Webrtc event data before connect");
            console.log("[Webrtc] Data", data.toString());
        });
        peer.on('stream', (stream) => {
            if (!this.connected) console.warn("Webrtc event stream before connect");
            console.log("[Webrtc] Stream");
            this.emit(ClientPeerEvents.stream, stream);
        });
        peer.on('error', (error: Error) => {
            console.warn("[Webrtc]  error", error);
            this.peerConnected = false;
            this.emit(ClientPeerEvents.disconnect);
        });
        return peer;
    }
}
