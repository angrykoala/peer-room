import { ClientPeer } from "../src/cli/client_peer";
import { SocketStremClient } from "../src/cli/cli";

const connectButton = document.querySelector('#connectButton') as HTMLButtonElement;

connectButton.addEventListener("click", () => {
    connectButton.disabled = true;
    connect();
});

async function connect(): Promise<void> {
    const videoList = document.querySelector('#videos')!;
    const videoConstrains = [800, 600];

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { max: videoConstrains[0] },
            height: { max: videoConstrains[1] },
            facingMode: "user"
        },
        audio: true
    });

    const socketStreamClient = new SocketStremClient({
        location: document.location.host,
    });

    await socketStreamClient.connect();
    socketStreamClient.on('peer-connected', (peer: ClientPeer) => {
        peer.stream(stream);
        let video: HTMLVideoElement;

        peer.on('stream', (peerStream) => {
            console.log('stream', peerStream);
            video = document.createElement('video');
            video.srcObject = peerStream;
            videoList.appendChild(video);
            video.play();
        });

        peer.on('disconnect', () => {
            if (video) {
                video.remove();
            }
        });
    });
}
