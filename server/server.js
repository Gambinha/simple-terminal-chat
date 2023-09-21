import http from "http";
import { Server } from "socket.io";
import { UploadFile } from "./uploadWorker.js";
import { DownloadFile } from "./downloadWorker.js";

const httpServer = http.createServer();

const io = new Server(httpServer, {
  path: "/socket.io",
  cors: {
    origin: "https://example.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

let messagesHistoric = [];
let files = {};

function handleUserMessage(socket, username, text) {
  if (text.includes("@ORDENAR")) {
    onOrdenarCommand(socket, username, text);
    return;
  }

  if (text.includes("@UPLOAD")) {
    onUploadCommand(socket, username, text);
    return;
  }

  if (text.includes("@DOWNLOAD")) {
    onDownloadCommand(socket, username, text);
    return;
  }

  messagesHistoric.push({ username, text, date: new Date() });
  socket.broadcast.emit("chatMessage", { username, text });
}

function onOrdenarCommand(socket, username, text) {
  const last15Messages = messagesHistoric.slice(-15);
  const message = last15Messages.reduce((acc, message) => {
    return `${acc}\n${message.username}:: ${message.text}`;
  }, "");

  socket.emit("ordenarMessage", { username, text: message });
}

function onUploadCommand(socket, username, text) {
  console.log(text);
  const fileName = text.split("-n=")[1].split(" ")[0];
  const fileContent = text.split("-c=")[1].split("!!end!!")[0];
  UploadFile({
    filename: fileName,
    content: fileContent,
  }).then((filePath) => {
    files = { ...files, [fileName]: filePath };

    socket.emit("uploadMessage", {
      username,
      text: "Upload concluído com sucesso!",
    });
  });
}

function onDownloadCommand(socket, username, text) {
  const fileName = text.split("-n=")[1].split(" ")[0];
  const filePath = files[fileName];

  if (!filePath) {
    socket.emit("errorDownloadMessage", {
      username,
      text: "Arquivo não existente!",
    });
    return;
  }

  DownloadFile({
    filePath,
  }).then((content) => {
    socket.emit("downloadMessage", {
      username,
      text: content,
    });
  });
}

io.on("connection", (socket) => {
  console.log("User connected " + socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected " + socket.id);
  });

  socket.on("message", ({ username, text }) => {
    handleUserMessage(socket, username, text);
  });
});

httpServer.listen(3333, () => {
  console.log("Its running on port 3333!");
});
