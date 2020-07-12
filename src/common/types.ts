export type ConnectionRequestResponse = {
    iceServers?: Array<RTCIceServer>
};

export enum SocketEvents {
    ConnectRequest = 'connect-request',
    PeerDisconnected = 'peer-disconnected',
    AddPeer = 'add-peer',
    Signal = 'signal'
}
