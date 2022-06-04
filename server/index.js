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
const routes = require("./routes/index");

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
let informGameStarted = function (playerId) {
    clients.get(playerId).emit("game_started");
}
let informGameAborted = function (playerId) {
    clients.get(playerId).emit("game_aborted");
}
let functions = {
    updateVisibleRooms: updateVisibleRooms,
    updateOnlineGames: updateOnlineGames,
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
    console.log("New client connected");
    let id = socket.handshake.query.myId;
    clients.set(id, socket);
    updateVisibleRooms(socket);
    updateOnlineUsers();
    updateOnlineGames(socket);
    updatePlayedGames(socket);

    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clients.delete(id);
        updateOnlineUsers();
    });
});

const port = 4001;
httpServer.listen(port, () => console.log(`Listening on port ${port}`));