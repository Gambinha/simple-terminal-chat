const http = require('http');
const { Server } = require("socket.io");

const httpServer = http.createServer();

const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: "https://example.com",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected " + socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected ' + socket.id);
    });

    socket.on('message', ({username, text}) => {
        socket.broadcast.emit('chatMessage', ({username, text}));
    })
});

httpServer.listen(3333, () => {
    console.log('Its running on port 3333!')
})