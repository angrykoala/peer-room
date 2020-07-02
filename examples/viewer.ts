import { ClientPeer } from "../src/cli/client_peer";
import { SocketStremClient } from "../src/cli/cli";


async function main() {
    const videoList = document.querySelector('#videos')!

    const socketStreamClient = new SocketStremClient({
        location: document.location.host,
    })


    await socketStreamClient.connect();
    socketStreamClient.on('peer-connected', (peer: ClientPeer) => {
        console.log("PEEER CONNECTED")
        let video: HTMLVideoElement;
        peer.on('stream', (stream) => {
            console.log('stream', stream)
            video = document.createElement('video')
            video.srcObject = stream
            videoList.appendChild(video);
            video.play()
        })

        peer.on('disconnect', () => {
            console.log("Disconnect peer")
            if (video) {
                video.remove()
            }
        })

    })
}

main();
