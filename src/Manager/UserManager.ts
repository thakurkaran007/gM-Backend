import { socketManager } from "./SocketManager";
import WebSocket from "ws";

export interface User {
    userId: string;
    socket: WebSocket;
}

class UserManager {
    private users: User[];
    private static instance: UserManager;

    private constructor() {
        this.users = [];
    }

    public static getInstance() {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }

        return UserManager.instance;
    }

    public addUser(user: User, roomId: string) {
        const room = socketManager.getRoom(roomId);
        if (!room) {
            console.log('Creating room: ', roomId);
            socketManager.createRoom(roomId);
        }
        socketManager.addUserToRoom(roomId, user);
        this.users.push(user);
    }

    public removeUser(ws: WebSocket) {
        const user = this.users.find((user) => user.socket === ws);
        if (!user) {
            console.log('User not found');
            return;
        }
        const userId = user.userId;
        this.users = this.users.filter((user) => user.userId !== userId);
        socketManager.removeUserFromRoom(userId);
    }
}

export const userManager = UserManager.getInstance();