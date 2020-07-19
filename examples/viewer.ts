import { ClientPeer } from "../src/cli/client_peer";
import { SocketWebRTCClient } from "..";

const connectButton = document.querySelector('#connectButton') as HTMLButtonElement;

connectButton.addEventListener("click", () => {
    connectButton.disabled = true;
    connect();
});

async function connect(): Promise<void> {
    const videoList = document.querySelector('#videos')!;

    const socketWebRTCClient = new SocketWebRTCClient({
        room: 'streamer-example'
    });

    socketWebRTCClient.connect({
        role: 'viewer'
    });
    socketWebRTCClient.on('peer-connected', (peer: ClientPeer) => {
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
