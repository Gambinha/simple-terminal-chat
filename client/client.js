import { io } from "socket.io-client";
import readline from "readline";
import { ReadFile } from "./readFileWorker.js";
import { DownloadFile } from "./downloadWorker.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function init() {
  const socket = io("http://localhost:3333/", { transports: ["websocket"] });

  rl.question("What is your name ? ", function (username) {
    console.log("Você entrou no Chat! Para sair digite 'exit'!");

    chat(socket, username);
  });
}

function chat(clientSocket, username) {
  waitForUserInput();

  function waitForUserInput() {
    rl.question("", function (text) {
      if (text == "@SAIR") {
        rl.close();
        clientSocket.disconnect();
      } else if (text.includes("@UPLOAD")) {
        onUpload(text);
      } else {
        clientSocket.emit("message", { username, text });
        waitForUserInput();
      }
    });
  }

  function onUpload(text) {
    console.log("Realizando leitura do arquivo...");
    ReadFile({
      filePath: text.split("-p=")[1].split("!")[0],
    }).then((content) => {
      console.log("Realizando upload do arquivo...");
      const newText = `${text} -c=${content}!!end!!`;
      clientSocket.emit("message", { username, text: newText });
      waitForUserInput();
    });
  }

  function handleUsername(emitter) {
    return username == emitter ? "Você" : emitter;
  }

  clientSocket.on("chatMessage", ({ username, text }) => {
    console.log(`${handleUsername(username)}:: ${text}`);
  });

  clientSocket.on("ordenarMessage", ({ username, text }) => {
    console.log(`ÚLTIMAS 15 MENSAGENS:\n${text}`);
  });

  clientSocket.on("uploadMessage", ({ username, text }) => {
    console.log(text);
  });

  clientSocket.on("errorDownloadMessage", ({ username, text }) => {
    console.log(text);
  });

  clientSocket.on("downloadMessage", ({ username, text }) => {
    console.log("Realizando escrita do arquivo...");

    DownloadFile({
      filename: "download.txt",
      content: text,
    }).then((_) => {
      console.log("Arquivo baixado com sucesso!");
    });
  });
}

init();
