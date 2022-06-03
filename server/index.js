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

const roomController = require("./controllers/roomController");
let updateVisibleRooms = function (client) {
    require("axios")
        .get('http://localhost:4001/rooms').then(res => {
        if (client === null) {
            clients.forEach(c => c.emit("room_list", res.data));
        } else {
            client.emit("room_list", res.data);
        }
    });
}
let functions = {updateVisibleRooms: updateVisibleRooms};
routes(app, functions);

const httpServer = require("http").createServer(app);
const io = new (require("socket.io").Server)(httpServer, {
    cors: corsOpts
});

let clients = [];
io.on("connection", (socket) => {
    console.log("New client connected");
    clients.push(socket);
    updateVisibleRooms(socket);

    socket.on("disconnect", () => {
        console.log("Client disconnected");
        const index = clients.indexOf(socket);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });
});

const port = 4001;
httpServer.listen(port, () => console.log(`Listening on port ${port}`));