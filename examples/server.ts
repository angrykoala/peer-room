import express from 'express';
import { Server } from 'http';
import path from 'path';
import { Peer } from '../src/server/peer';
import SocketIO from 'socket.io';
import { SocketStreamRoom } from '../src/server/room';

const app = express();
const server = new Server(app);
const io = SocketIO(server);

const streamerExampleRoom = new SocketStreamRoom(io, 'streamer-example', {
    // iceServers: [{  // Using custom ice servers
    //   urls: "stun:global.stun.twilio.com:3478?transport=udp"
    // }]
});

streamerExampleRoom.connectRoles('streamer', 'viewer');

streamerExampleRoom.on('connection', (peer: Peer, payload: any) => {
    console.log("Peer connected to streamer room", peer.id, payload);
    if (payload && payload.role) { // For security reasons, role must be explicitly set in server, if no role is defined, a default role will be assigned
        peer.addRole(payload.role);
    }
    streamerExampleRoom.registerPeer(peer);
});

const streamRoom = new SocketStreamRoom(io);
streamRoom.on('connection', (peer: Peer) => {
    console.log("Peer connected to default room");
    streamRoom.registerPeer(peer);
});

app.use(express.static(path.join(__dirname, 'dist')));

server.listen(1222, () => {
    console.log("Listening at 1222");
});
