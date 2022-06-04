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
let informGameStatus = function (room, playerId) {
    const client = clients.get(playerId);
    if (client !== undefined) {
        client.emit("game_full", room.status == RoomConstants.FULL || room.status == RoomConstants.STARTED);
        client.emit("game_started", room.status == RoomConstants.STARTED);
        client.emit("game_finished", room.status == RoomConstants.FINISHED);
        client.emit("game_aborted", room.status == RoomConstants.ABORTED);
        client.emit("my_name", room.player0 == playerId ? 'player0' : 'player1');
        client.emit("my_turn", (!room.player && room.player0 == playerId) || (room.player && room.player1 == playerId));
        client.emit("game_values", room.values);
        client.emit("game_winner", room.winner);
        client.emit("game_victory_pos", room.victoryPos);
    } else {
        console.log("undefined!");
    }
}
let informGameFull = function (playerId, full) {
    const client = clients.get(playerId);
    if (client !== undefined) {
        client.emit("game_full", full);
    } else {
        console.log("undefined!");
    }
}
let informGameStarted = function (playerId, started) {
    const client = clients.get(playerId);
    if (client !== undefined) {
        client.emit("game_started", started);
    } else {
        console.log("undefined!");
    }
}
let informGameAborted = function (playerId) {
    const client = clients.get(playerId);
    if (client !== undefined) {
        client.emit("game_aborted", true);
    } else {
        console.log("undefined!");
    }
}
let functions = {
    updateVisibleRooms: updateVisibleRooms,
    updateOnlineGames: updateOnlineGames,
    informGameStatus: informGameStatus,
    informGameFull: informGameFull,
    informGameStarted: informGameStarted,
    informGameAborted: informGameAborted,
};
routes(app, functions);

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
    });
});

const port = 4001;
httpServer.listen(port, () => console.log(`Listening on port ${port}`));