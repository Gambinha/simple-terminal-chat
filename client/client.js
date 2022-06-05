const io = require("socket.io-client")
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function init() {
    socket = io("http://localhost:3333/", { transports : ['websocket'] });


    rl.question('What is your name ? ', function (username) {
        console.log("Você entrou no Chat! Para sair digite 'exit'!")

        chat(socket, username); 
    });
}

function chat(clientSocket, username) {
    waitForUserInput();

    function waitForUserInput() {
        rl.question("", function(text) {
            if (text == "exit"){
                rl.close();
                clientSocket.disconnect();
            } else {
                clientSocket.emit('message', ({username, text}));
                waitForUserInput();
            }
        });
    }
    
    clientSocket.on('chatMessage', ({username, text}) => {
        console.log(`${username}: ${text}`);
    })

    // clientSocket.on('userConnected', (username) => {
    //     console.log(`${username} connected`);
    // })

    // clientSocket.on('userDisconnected', (username) => {
    //     console.log(`${username} disconnected`);
    // })
}

init();

