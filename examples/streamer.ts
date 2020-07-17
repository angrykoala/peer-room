import { ClientPeer } from "../src/cli/client_peer";
import { SocketStreamClient } from "..";

async function main(): Promise<void> {
    const videoConstrains = [800, 600];

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { max: videoConstrains[0] },
            height: { max: videoConstrains[1] },
            facingMode: "user"
        },
        audio: false
    });

    const socketStreamClient = new SocketStreamClient({
        room: 'streamer-example'
    });

    await socketStreamClient.connect({
        role: 'streamer',
    });
    socketStreamClient.on('peer-connected', (peer: ClientPeer) => {
        peer.stream(stream);
    });
}

main();
