const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
const corsOpts = {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"/*, "PUT"*/],
};
app.options("*", cors(corsOpts));
app.use(cors(corsOpts));
const routes = require("./src/routes/index");
const RoomConstants = require("./src/models/roomConstants").RoomConstants;

let updateVisibleRooms = function (client) {
    require("axios")
        .get('http://localhost:4001/rooms').then(res => {
        if (client === null) {
            clients.forEach(socket => socket.emit("room_list", res.data));
        } else {
            client.emit("room_list", res.data);
        }
    });
}
let updateOnlineUsers = function () {
    clients.forEach(socket => socket.emit("online_users", clients.size));
}
let updateOnlineGames = function (client) {
    require("axios")
        .get('http://localhost:4001/rooms/active-count').then(res => {
        if (client === null) {
            clients.forEach(socket => socket.emit("online_games", res.data));
        } else {
            client.emit("online_games", res.data);
        }
    });
}
let updatePlayedGames = function (client) {
    require("axios")
        .get('http://localhost:4001/rooms/played-count').then(res => {
        if (client === null) {
            clients.forEach(socket => socket.emit("played_games", res.data));
        } else {
            client.emit("played_games", res.data);
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
            console.log(message.from + " vs " + playerId);
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

function removeFromRoom(id) {
    require("axios")
        .get('http://localhost:4001/rooms/player/' + id).then(res => {
        res.data.forEach(room => {
            require("axios")
                .post('http://localhost:4001/room/leave/' + room._id, {myId: id}).then();
        })
    });
}

const httpServer = require("http").createServer(app);
const io = new (require("socket.io").Server)(httpServer, {
    cors: corsOpts
});

let clients = new Map;
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