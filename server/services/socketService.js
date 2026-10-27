import { Server } from 'socket.io';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
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
    // Also emit globally so dashboard and customer views update in real time
    io.emit('queue_updated', { queueId, ...data });
  }
}

export function broadcastBusinessUpdate(businessId, data) {
  if (io && businessId) {
    io.to(`business:${businessId}`).emit('business_queue_updated', data);
    // Also emit globally so staff across all devices stay synced
    io.emit('business_queue_updated', { businessId, ...data });
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
    io.emit('token_status_changed', alertData);
  }
}

export function broadcastTokenUpdate(tokenData) {
  if (io && tokenData) {
    io.emit('token_status_changed', tokenData);
    const id = tokenData._id ? tokenData._id.toString() : null;
    if (id) {
      io.emit(`token_alert:${id}`, tokenData);
    }
    if (tokenData.tokenNumber) {
      io.emit(`token_alert:${tokenData.tokenNumber}`, tokenData);
    }
  }
}

export function broadcastTokensBatchUpdate(tokensList) {
  if (io && tokensList && tokensList.length > 0) {
    const sanitized = tokensList.map((t) => ({
      _id: t._id ? t._id.toString() : t.id,
      tokenNumber: t.tokenNumber,
      peopleAhead: t.peopleAhead,
      position: t.position,
      estimatedWaitMinutes: t.estimatedWaitMinutes,
      status: t.status,
      calledAt: t.calledAt,
      serviceStartedAt: t.serviceStartedAt,
      completedAt: t.completedAt,
    }));
    io.emit('tokens_batch_updated', sanitized);
  }
}
