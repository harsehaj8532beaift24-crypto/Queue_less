import { Server } from 'socket.io';

let io = null;

export function initSocket(httpServer, allowedOrigin = 'http://localhost:5173') {
  io = new Server(httpServer, {
    cors: {
      origin: [allowedOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Client joins specific queue room for live updates
    socket.on('join_queue', (queueId) => {
      if (queueId) {
        socket.join(`queue:${queueId}`);
      }
    });

    socket.on('leave_queue', (queueId) => {
      if (queueId) {
        socket.leave(`queue:${queueId}`);
      }
    });

    // Client joins business room (for staff/admin dashboard)
    socket.on('join_business', (businessId) => {
      if (businessId) {
        socket.join(`business:${businessId}`);
      }
    });

    // Authenticated user joins personal notification room
    socket.on('subscribe_user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  console.log('⚡ [Socket.IO] Real-time engine initialized');
  return io;
}

export function getIO() {
  return io;
}

export function broadcastQueueUpdate(queueId, data) {
  if (io && queueId) {
    io.to(`queue:${queueId}`).emit('queue_updated', data);
  }
}

export function broadcastBusinessUpdate(businessId, data) {
  if (io && businessId) {
    io.to(`business:${businessId}`).emit('business_queue_updated', data);
  }
}

export function sendUserNotification(userId, notification) {
  if (io && userId) {
    io.to(`user:${userId}`).emit('new_notification', notification);
  }
}

export function broadcastTokenAlert(tokenId, alertData) {
  if (io && tokenId) {
    io.emit(`token_alert:${tokenId}`, alertData);
  }
}
