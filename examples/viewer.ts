import { ClientPeer } from "../src/cli/client_peer";
import { SocketStreamClient } from "..";

const connectButton = document.querySelector('#connectButton') as HTMLButtonElement;

connectButton.addEventListener("click", () => {
    connectButton.disabled = true;
    connect();
});

async function connect(): Promise<void> {
    const videoList = document.querySelector('#videos')!;

    const socketStreamClient = new SocketStreamClient({
        room: 'streamer-example'
    });

    socketStreamClient.connect({
        role: 'viewer'
    });
    socketStreamClient.on('peer-connected', (peer: ClientPeer) => {
        let video: HTMLVideoElement;
        peer.on('stream', (stream) => {
            console.log('stream', stream);
            video = document.createElement('video');
            video.srcObject = stream;
            videoList.appendChild(video);
            video.play();
        });

        peer.on('disconnect', () => {
            console.log("Disconnect peer");
            if (video) {
                video.remove();
            }
        });

    });
}
