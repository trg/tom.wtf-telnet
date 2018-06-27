const net = require('net');
const findIndex = require('lodash/findIndex');

const { cleanInput, writeFileContents } = require('./utils');

// Server Config
const PORT = 8888;

// Server State
const activeSessionSockets = [];

const receiveData = (socket, data) => {
    const input = cleanInput(data);
    switch(input) {
        case 'help':
            writeFileContents(socket, 'help')
                .then(prompt(socket));
            break;
        case 'quit':
            socket.end('See ya.\n');
            break;
        case 'sessions':
            socket.write(activeSessionSockets);
            break;
        case 'cwd':
            break;
        default:
            socket.write('Command not found. Type help for help.\n');
            prompt(socket);
    }
};

const prompt = (socket) => {
    socket.write(`\n> `);
}

// When a new telnet client connects
const startSession = (socket) => {
    activeSessionSockets.push({
        socket,
        cwd: '/'
    });
    socket.write(`There are ${activeSessionSockets.length} users online.\n`);
    writeFileContents(socket, 'home');
    socket.on('data', data => receiveData(socket, data));
    socket.on('end', () => onSocketClose(socket));
    console.log(activeSessionSockets);
}

// When a telnet client disconnects
const onSocketClose = (socket) => {
    const i = findIndex(activeSessionSockets, _s => socket === _s );
    console.log(i);
	if (i != -1) {
		activeSessionSockets.splice(i, 1);
	}
}

const server = net.createServer().listen(PORT);
server.on('connection', startSession);