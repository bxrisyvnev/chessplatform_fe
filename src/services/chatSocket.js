import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

let stompClient = null;
const API_URL = import.meta.env.VITE_API_URL;

export function connectToChat(streamId, onMessageReceived, onViewerCountUpdate) {
    const socket = new SockJS(`${API_URL}/ws`);
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        // Chat messages
        stompClient.subscribe(`/topic/stream/${streamId}/chat`, (message) => {
            const msg = JSON.parse(message.body);
            onMessageReceived(msg);
        });

        // Viewer count updates
        stompClient.subscribe(`/topic/stream/${streamId}/viewers`, (message) => {
            const viewerCount = parseInt(message.body);
            onViewerCountUpdate(viewerCount);
        });

        // Join event
        stompClient.send(`/app/stream/${streamId}/viewer/join`, {});
    });
}

export function disconnectFromChat(streamId) {
    try {
        if (stompClient && stompClient.connected) {
            stompClient.send(`/app/stream/${streamId}/viewer/leave`, {});
            stompClient.disconnect(() => {
                console.log('Disconnected');
            });
        }
    } catch (error) {
        console.warn("Tried to disconnect but stompClient was not connected.", error);
    }
}

export function sendChatMessage(streamId, content, sender) {
    if (stompClient && stompClient.connected) {
        stompClient.send(`/topic/stream/${streamId}/chat`, {}, JSON.stringify({ content, sender }));
    }
}
