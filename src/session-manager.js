const find = require('lodash/find');
const findIndex = require('lodash/findIndex');

// Server State
// TODO - use dictionary instead of list to improve lookup time
const activeSessions = [];

// state / methods added to socket object
const SOCKET_DECORATION = {
    env: {
        pwd: "/",
        username: undefined,
        inChat: false
    },
    getEnvString: function () {
        return `pwd: ${this.env.pwd}`;
    },
    setUsername: function (username) {
        this.env.username = username.substring(0, 12);
    },
    println: function (text) {
        this.write(`${text}\n`);
    },
    printMessage: function (obj, cb = function () {}) {
        this.write(`${obj}\n\n`, 'utf8', cb());
    }
}

module.exports = {

    create: socket => {
        const session = Object.assign(socket, SOCKET_DECORATION);
        activeSessions.push(session);
    },

    remove: socket => {
        const i = findIndex(activeSessions, session => session.socket === socket);
	    if (i != -1) {
		    activeSessions.splice(i, 1);
	    }
    },

    getSessionDataForSocket: (socket) => {
        return find(activeSessions, session => session.socket === socket);
    },

    activeSessionCount: () => {
        return activeSessions.length;
    },

    getSessions: () => {
        return activeSessions;
    },

    printEnv: (socket) => {
        
    }
}