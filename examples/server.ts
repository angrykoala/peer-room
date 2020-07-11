import express from 'express';
import { Server } from 'http';
import path from 'path';
import { SocketStreamRoom } from '../src/server/server';
import { Peer } from '../src/server/peer';

const app = express();
const server = new Server(app);

const streamRoom = new SocketStreamRoom(server);

streamRoom.connectRoles('streamer', 'viewer');

streamRoom.on('connection', (peer: Peer, payload: any) => {
    console.log("Peer connected", peer.id, payload);
    if (payload && payload.role) { // For security reasons, role must be explicitly set in server, if no role is defined, a default role will be assigned
        peer.addRole(payload.role);
    }
    streamRoom.registerPeer(peer);
});

app.use(express.static(path.join(__dirname, 'dist')));

server.listen(1222, () => {
    console.log("Listening at 1222");
});
