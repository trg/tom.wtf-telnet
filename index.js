const net = require('net');

const { cleanInput, writeFileContents } = require('./src/utils');
const sessionManager = require('./src/session-manager');
const processCommand = require('./src/commands').processCommand;

// Server Config
const PORT = 8888;

const receiveData = (socket, data) => {
    const input = cleanInput(data);
    if (input.length > 0) {
        processCommand(socket, input)
    }
};

// When a new telnet client connects
const startSession = (socket) => {
    // Create Session in server storage
    sessionManager.create(socket);
    // Setup Event Handlers
    socket.on('data', data => receiveData(socket, data));
    socket.on('end', () => sessionManager.remove(socket));
    // Print Welcome Message
    writeFileContents(socket, 'home')
        .then(socket.printMessage(`\nThere are ${sessionManager.activeSessionCount()} sessions online.`))
}

const server = net.createServer().listen(PORT);
server.on('connection', startSession);