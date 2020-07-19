import express from 'express';
import { Server } from 'http';
import path from 'path';
import { Peer } from '../src/server/peer';
import SocketIO from 'socket.io';
import { PeerRoom } from '..';

const app = express();
const server = new Server(app);
const io = SocketIO(server);

const streamerRoom = new PeerRoom(io, 'streamer-example', {
    // iceServers: [{  // Using custom ice servers
    //   urls: "stun:global.stun.twilio.com:3478?transport=udp"
    // }]
});

streamerRoom.connectRoles('streamer', 'viewer');

streamerRoom.on('connection', (peer: Peer, payload: any) => {
    console.log("Peer connected to streamer room", peer.id, payload);
    if (payload && payload.role) { // For security reasons, role must be explicitly set in server, if no role is defined, a default role will be assigned
        peer.addRole(payload.role);
    }
    streamerRoom.registerPeer(peer);
});

const chatRoom = new PeerRoom(io);
chatRoom.on('connection', (peer: Peer) => {
    console.log("Peer connected to default room");
    chatRoom.registerPeer(peer);

    peer.on('buzz', () => {
        chatRoom.notifyPeersOf('buzz', peer);
    });
});

app.use(express.static(path.join(__dirname, 'dist')));

server.listen(1222, () => {
    console.log("Listening at 1222");
});
