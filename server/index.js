const express = require("express");
const app = express();
app.use(express.json());

// Allow Cross-Origin Resource Sharing on localhost:3000, the client app
const cors = require("cors");
const corsOpts = {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"],
};
app.options("*", cors(corsOpts));
app.use(cors(corsOpts));
const routes = require("./src/routes/index");
const RoomConstants = require("./src/models/roomConstants").RoomConstants;
const RoomController = require("./src/controllers/roomController");

/* Functions to push data through the socket, if a client's socket is passed then the data is pushed to him only,
* every connected user receives the data update otherwise */
let updateVisibleRooms = function (client) {
    RoomController.listRoomsInternal((err, doc) => {
        const visibleRooms = err ? [] : doc;
        if (client === null) {
            clients.forEach(socket => socket.emit("room_list", visibleRooms));
        } else {
            client.emit("room_list", visibleRooms);
        }
    });
}
let updateOnlineUsers = function () {
    clients.forEach(socket => socket.emit("online_users", clients.size));
}
let updateOnlineGames = function (client) {
    RoomController.countActiveRoomsInternal((err, doc) => {
        const onlineGames = err ? 0 : doc;
        if (client === null) {
            clients.forEach(socket => socket.emit("online_games", onlineGames));
        } else {
            client.emit("online_games", onlineGames);
        }
    });
}
let updatePlayedGames = function (client) {
    RoomController.countPlayedGamesInternal((err, doc) => {
        const playedGames = err ? 0 : doc;
        if (client === null) {
            clients.forEach(socket => socket.emit("played_games", playedGames));
        } else {
            client.emit("played_games", playedGames);
        }
    });
}
let informGameStatus = function (room) {
    if (room === null) {
        return;
    }
    const clientsToInform = [room.player0, room.player1];
    clientsToInform.forEach(playerId => {
        const client = clients.get(playerId);
        if (client !== undefined) {
            let gameStatus = {
                myName: room.player0 == playerId ? 'player0' : 'player1',
                myTurn: (!room.player && room.player0 == playerId) || (room.player && room.player1 == playerId),
                name: room.name,
                full: room.status == RoomConstants.FULL,
                started: room.status == RoomConstants.STARTED,
                finished: room.status == RoomConstants.FINISHED,
                closed: room.status == RoomConstants.CLOSED,
                aborted: room.status == RoomConstants.ABORTED,
                values: room.values,
                winner: room.winner,
                victoryPos: room.victoryPos,
            }
            client.emit("game_status", gameStatus);
        }
    });
}
let newChatMessage = function (room, message) {
    if (room === null || message === null) {
        return;
    }
    const clientsToInform = [room.player0, room.player1];
    clientsToInform.forEach(playerId => {
        const client = clients.get(playerId);
        if (client !== undefined) {
            client.emit("chat_message", {msg: message.msg, received: message.from !== playerId, timestamp: Date.now()});
        }
    });
}
let functions = {
    updateVisibleRooms: updateVisibleRooms,
    updateOnlineGames: updateOnlineGames,
    informGameStatus: informGameStatus,
    newChatMessage: newChatMessage
};
routes(app, functions);

/* Use on client disconnection to update the room status and inform the players */
function removeFromRoom(id) {
    RoomController.getRoomsByPlayerInternal(id, (err, doc) => {
        const roomsByPlayer = err ? [] : doc;
        roomsByPlayer.forEach(room => {
            RoomController.updateRoomCountInternal(room._id, id, false, () => {}).then(room => {
                updateVisibleRooms(null);
                updateOnlineGames(null)
                informGameStatus(room);
            });
        })
    });
}

// Allow Cross-Origin Resource Sharing on localhost:3000, the client app
const httpServer = require("http").createServer(app);
const io = new (require("socket.io").Server)(httpServer, {
    cors: corsOpts
});

let clients = new Map;  //client id, socket
io.on("connection", (socket) => {
    let id = socket.handshake.query.myId;
    console.log("New client connected: " + id);
    clients.set(id, socket);
    updateVisibleRooms(socket);
    updateOnlineUsers();
    updateOnlineGames(socket);
    updatePlayedGames(socket);

    socket.on("disconnect", () => {
        console.log("Client disconnected: " + id);
        clients.delete(id);
        updateOnlineUsers();
        removeFromRoom(id);
    });
});

const port = 4001;
httpServer.listen(port, () => console.log(`Listening on port ${port}`));