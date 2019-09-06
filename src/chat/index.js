const sessionManager = require('../session-manager');
const forEach = require('lodash/forEach');

module.exports = {
    enter: (socket) => {
        socket.env.inChat = true;
        socket.printMessage("Entering chat, please enter a username:");
    },

    processChatCommand: function (socket, input) {
        if(!socket.env.username) {
           socket.env.username = input.substring(0, 12);
           socket.printMessage(`Your username is now: ${socket.env.username}`);
           socket.printMessage(`Type /leave to leave; everything else is chat.`);
           return;
        }
        if (input === "/leave") {
            this.leave(socket);
            return;
        }
        // Write to other users
        const sessions = sessionManager.getSessions();
        forEach(sessions, (session) => {
            if(session.socket !== socket)
                session.printMessage(`${socket.env.username}: ${input}`);
        });
    },

    leave: (socket) => {
        socket.env.inChat = false;
        socket.printMessage("Goodbye.");
    }
}



