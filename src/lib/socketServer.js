/**
 * socketServer.js — Socket.io instance store.
 *
 * Holds a module-level reference to the Socket.io server so API routes
 * (e.g. /api/sos) can emit events without having direct access to the
 * server object created in server.js. Set once at startup via setSocketServer(),
 * then read anywhere via getSocketServer().
 */

let socketServer = null;

function setSocketServer(io) {
  socketServer = io;
}

function getSocketServer() {
  return socketServer;
}

module.exports = { getSocketServer, setSocketServer };
