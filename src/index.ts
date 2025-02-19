import { WebSocketServer } from 'ws';
import { userManager } from './Manager/UserManager';

const wss = new WebSocketServer({ port: 8080 }, () => {
    console.log('WebSocket server is listening on ws://localhost:8080');
});

wss.on('connection', (ws) => {
    ws.on('error', console.error);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('Received:', data);
            switch (data.type) {
                case 'join-room':
                    userManager.addUser({ userId: data.userId, socket: ws }, data.roomId);
                    break;
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
                case 'remove-user':
                    console.log('User removed');
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Invalid JSON:', error);
        }
    });

    ws.on('close', () => {
        userManager.removeUser(ws);
        console.log('Client disconnected');
    });
});