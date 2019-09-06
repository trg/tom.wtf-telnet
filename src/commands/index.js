const fs = require('fs');

const writeFileContents = require('../utils').writeFileContents;
const chat = require('../chat');

// TODO refactor validation into socket prototype (probably)
const sanitizePathInput = (input) => {
    // TODO - better verison of this
    input = input.replace(/\./g, ''); // no dots allowed (hidden files, parent directory traversal)
    return input;
}

const sanitizedPath = (pwd, filename = undefined) => {
    pwd = sanitizePathInput(pwd);
    if (filename) filename = sanitizePathInput(filename)
    return `files/root${pwd}${ filename ? '/' + filename : ''}`;
}

const commands = {
    "ls": (socket) => {
        const dir = sanitizedPath(socket.env.pwd);
        fs.readdir(dir, (err, fileOrDirNames) => {
            if (err) {
                socket.printMessage("!! Error listing directory");
                return;
            }
            // TODO performance improve:
            const dirNames = fileOrDirNames.filter(f => fs.lstatSync(`${dir}/${f}`).isDirectory());
            const fileNames = fileOrDirNames.filter(f => fs.lstatSync(`${dir}/${f}`).isFile());
            if (dirNames.length > 0) {
                socket.println('Directories:');
                for (let dirName of dirNames) {
                    socket.println(`${dirName}`);
                }
                socket.println('');
            }
            if (fileNames.length > 0) {
                socket.println('Files:');
                for (let fileName of fileNames) {
                    socket.println(fileName);
                }
                socket.println('');
            }
        });
    },
    "print": (socket, args) => {
        if (args.length !== 1) return;
        const fileName = sanitizePathInput(args[0]);
        const path = `root${socket.env.pwd}${fileName}`;
        writeFileContents(socket, path);
    },
    "cd": (socket, args) => {
        if (args.length !== 1) return;
        const desiredDir = args[0];
        if (desiredDir === '/') {
            socket.env.pwd = '/';
        } else if (desiredDir === '..') {
            if (socket.env.pwd !== '/') {
                const parts = socket.env.pwd.split('/').filter(n => n !== '')
                parts.pop();
                socket.env.pwd = '/' + parts.join('/');
            } else {
                socket.printMessage("!! Cannot change to that directory.");
            }
        } else {
            // TODO - bug when doing cd ../../
            const newDir = `${socket.env.pwd}${sanitizePathInput(desiredDir)}/`;
            const realPath = sanitizedPath(newDir);
            if (fs.existsSync(realPath) && fs.lstatSync(realPath).isDirectory()) { // TODO - improve, confusion between "real" dir and sandboxed dir
                socket.env.pwd = newDir;
            } else {
                socket.printMessage("!! Not a directory.");
            }
        }
        socket.printMessage(`Your current directory is now ${socket.env.pwd}`);
    },
    "chat": (socket) => {
        chat.enter(socket);
    },
    "help": (socket) => {
        writeFileContents(socket, 'help');
    },
    "home": (socket) => {
        writeFileContents(socket, 'home');
    },
    "env": (socket) => {
        socket.printMessage(socket.getEnvString());
    },
    "pwd": (socket) => {
        socket.printMessage(socket.env.pwd); 
    },
    "quit": (socket) => {
        socket.end('See ya.\n');
    }
}

module.exports = {
    processCommand: (socket, input) => {
        const commandComponents = input.split(' ');
        if (!commandComponents) return;
        const command = commandComponents[0];
        const args = commandComponents.slice(1);
        const commandMethod = commands[command];
        if (socket.env.inChat) {
            chat.processChatCommand(socket, input);
        } else if (commandMethod) {
            socket.printMessage(`${' '.repeat(command.length)} \\_________`);
            commandMethod(socket, args);
        } else {
            socket.printMessage('Command not found. Type help for help.');
        }
    }
}