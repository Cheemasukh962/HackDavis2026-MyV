/**
 * ChatFeature — anonymous real-time messaging via Socket.io.
 *
 * Activated in src/app.js when config.features.enable_anonymous_chat === true.
 *
 * Privacy contract:
 *  - No user accounts, no persistent IDs, no IP logging.
 *  - Message content is relayed but never written to a log or database.
 *  - Room IDs are ephemeral; they exist only for the duration of a socket session.
 */

class ChatFeature {
  /**
   * @param {import('socket.io').Server} io
   */
  static init(io) {
    console.log('[ChatFeature] Anonymous chat enabled.');

    io.on('connection', (socket) => {
      // socket.id is a random ephemeral ID — safe to log for debug purposes.
      console.log(`[ChatFeature] Client connected: ${socket.id}`);

      /**
       * Client emits:  { roomId: string }
       * Server joins the socket to that room and notifies existing members.
       */
      socket.on('join_room', ({ roomId }) => {
        if (!roomId || typeof roomId !== 'string') return;

        socket.join(roomId);
        // Broadcast to everyone in the room EXCEPT the joining socket.
        socket.to(roomId).emit('user_joined', { roomId });
      });

      /**
       * Client emits:  { roomId: string, message: string }
       * Server broadcasts to all sockets in the room (including sender).
       * Message content is never stored.
       */
      socket.on('send_message', ({ roomId, message }) => {
        if (!roomId || !message || typeof message !== 'string') return;

        io.to(roomId).emit('receive_message', {
          senderId: socket.id,
          message,
          timestamp: Date.now(),
        });
      });

      socket.on('disconnect', () => {
        console.log(`[ChatFeature] Client disconnected: ${socket.id}`);
      });
    });
  }
}

module.exports = { ChatFeature };
