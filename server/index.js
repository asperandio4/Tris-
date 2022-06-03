const app = require("express")().use(require("./routes/index"));
const httpServer = require("http").createServer(app);
const io = new (require("socket.io").Server)(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});

let interval;
io.on("connection", (socket) => {
    console.log("New client connected");
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};

const port = process.env.PORT || 4001;
httpServer.listen(port, () => console.log(`Listening on port ${port}`));