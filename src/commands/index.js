const fs = require('fs');

const writeFileContents = require('../utils').writeFileContents;

const sanitizedPath = (pwd, filename = undefined) => {
    // TODO - better verison of this
    pwd = pwd.replace(/./g, '');
    pwd = pwd.replace(/\//g, '');
    return `files/root${pwd}${ filename ? '/' + filename : ''}`;
}

const commands = {
    "ls": (socket) => {
        const dir = sanitizedPath(socket.env.pwd);
        fs.readdir(dir, (err, fileOrDirNames) => {
            if (err) {
                socket.printMessage("Error");
                return;
            }
            // TODO performance improve:
            const dirNames = fileOrDirNames.filter(f => fs.lstatSync(`${dir}/${f}`).isDirectory());
            const fileNames = fileOrDirNames.filter(f => fs.lstatSync(`${dir}/${f}`).isFile());
            if (dirNames) {
                socket.println('Directories:');
                for (let dirName of dirNames) {
                    socket.println(`${dirName}/`);
                }
                socket.println('');
            }
            if (fileNames) {
                socket.println('Files:');
                for (let fileName of fileNames) {
                    socket.println(fileName);
                }
                socket.println('');
            }
        });
    },
    "print": (socket, args) => {
        const path = `root/${socket.env.pwd.substring(1)}${args[0]}`; // TODO Security
        console.log("path", path);
        writeFileContents(socket, path);
    },
    "help": (socket) => {
        writeFileContents(socket, 'help');
    },
    "home": (socket) => {
        writeFileContents(socket, 'home');
    },
    "env": (socket) => {
        socket.printMessage(socket.getEnvSting());
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
        if (commandMethod) {
            socket.printMessage(`${' '.repeat(command.length)} \\_________`);
            commandMethod(socket, args);
        } else {
            socket.printMessage('Command not found. Type help for help.');
        }
    }
}