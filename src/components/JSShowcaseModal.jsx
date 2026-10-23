import React, { useState } from 'react';
import { X, Code2, BookOpen, Terminal, Sparkles, CheckCircle2, Play, Database, Server, Shield, Cpu } from 'lucide-react';

const SYLLABUS_TOPICS = [
  {
    id: 'variables-es6',
    title: '1. JavaScript Core & ES6+ (let/const, Destructuring, Spread)',
    category: 'JavaScript',
    description: 'Usage of const, let, template literals, object destructuring, and spread operator in QueueLess state management.',
    code: `// QueueLess JS Implementation: Object Destructuring & Spread Operator
const updateTokenStatus = (tokenId, newStatus) => {
  setTokens(prevTokens => 
    prevTokens.map(token => {
      if (token._id === tokenId || token.tokenId === tokenId) {
        // ES6 Spread Operator & Property Update
        return { 
          ...token, 
          status: newStatus,
          updatedAt: new Date().toISOString() 
        };
      }
      return token;
    })
  );
};`,
  },
  {
    id: 'array-hof',
    title: '2. Array Higher-Order Functions (map, filter, reduce)',
    category: 'JavaScript',
    description: 'Filtering active venues, transforming tokens, and calculating total queue wait times using map, filter, and reduce.',
    code: `// QueueLess Queue Calculations: Array map, filter, and reduce
// 1. Filter tokens by queue and active status
const activeQueue = tokens.filter(t => t.queue === queueId && t.status === 'waiting');

// 2. Reduce to calculate accumulated waiting duration
const totalWaitTime = activeQueue.reduce((acc, curr) => {
  return acc + (curr.estimatedWaitMinutes || 10);
}, 0);

// 3. Map venues to append dynamic queue metrics
const formattedVenues = venues.map(venue => ({
  ...venue,
  hasActiveWait: venue.currentQueueLength > 0
}));`,
  },
  {
    id: 'async-await-fetch',
    title: '3. Asynchronous Programming & REST API Fetching',
    category: 'JavaScript',
    description: 'Non-blocking async/await calls using Fetch API with try/catch error handling.',
    code: `// Fetching real-time business and queue data asynchronously
export async function fetchLiveBusinesses() {
  try {
    const response = await fetch('http://localhost:5000/api/businesses', {
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    return result.data;
  } catch (error) {
    console.error('Async API Fetch Error:', error.message);
    throw error;
  }
}`,
  },
  {
    id: 'nodejs-runtime',
    title: '4. Node.js Architecture (Non-Blocking I/O & Event Loop)',
    category: 'Node.js',
    description: 'HTTP server creation, event emitters, environment variables with dotenv, and graceful process shutdown.',
    code: `// Node.js HTTP Server & Graceful Signal Handling
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

const server = http.createServer(app);

// Graceful process shutdown on termination signals
function gracefulShutdown(signal) {
  console.log(\`Received \${signal}. Closing HTTP and DB connections...\`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));`,
  },
  {
    id: 'express-routing',
    title: '5. Express.js REST Framework & Middleware Pipeline',
    category: 'Express.js',
    description: 'Modular routing, request/response cycle, JSON body parsing, CORS, and centralized error handling.',
    code: `// Express.js Route & Centralized Error Handler
import express from 'express';
const router = express.Router();

router.post('/queues/:queueId/join', optionalToken, joinQueue);
router.post('/queues/:queueId/next', verifyToken, requireRole('staff'), callNext);

// Centralized Express Error Handler
export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}`,
  },
  {
    id: 'mongodb-mongoose',
    title: '6. MongoDB Atlas & Mongoose Schemas & Relations',
    category: 'MongoDB',
    description: 'Mongoose schemas, ObjectId references, virtual population, unique compound indexes, and timestamps.',
    code: `// Mongoose Token Schema with Compound Unique Index
const tokenSchema = new mongoose.Schema({
  tokenNumber: { type: String, required: true },
  sequenceNumber: { type: Number, required: true },
  queue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  status: { type: String, enum: ['waiting', 'calling', 'serving', 'completed', 'cancelled'], default: 'waiting' }
}, { timestamps: true });

// Concurrency & Scope Protection: Unique sequence number per queue
tokenSchema.index({ queue: 1, sequenceNumber: 1 }, { unique: true });`,
  },
  {
    id: 'queue-concurrency',
    title: '7. Database Concurrency & Atomic Token Allocation',
    category: 'Backend',
    description: 'Preventing race conditions and duplicate token numbers using atomic findOneAndUpdate operations.',
    code: `// Concurrency-Safe Atomic Token Allocation
export async function bookToken({ queueId, customerName }) {
  // Atomically increment queue sequence without race conditions
  const queue = await Queue.findOneAndUpdate(
    { _id: queueId, status: 'active' },
    { $inc: { tokenSequence: 1 } },
    { new: true }
  );
  if (!queue) throw new Error('Queue is unavailable');

  const seqNum = queue.tokenSequence;
  const tokenNumber = \`QL-TOK-\${seqNum}\`;
  return await Token.create({ tokenNumber, sequenceNumber: seqNum, queue: queueId, customerName });
}`,
  },
  {
    id: 'security-auth',
    title: '8. Cybersecurity: bcrypt Hashing & JWT Authorization',
    category: 'Security',
    description: 'Salted password hashing, JWT generation & verification, and Role-Based Access Control (RBAC).',
    code: `// Password Hashing with bcrypt & JWT RBAC
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
}`,
  },
  {
    id: 'mongodb-aggregation',
    title: '9. MongoDB Aggregation Pipeline for Real Analytics',
    category: 'MongoDB',
    description: 'Data aggregation pipelines with $match, $group, and $sort computing KPIs and hourly traffic distributions.',
    code: `// MongoDB Aggregation Pipeline for Business Analytics
const statusCounts = await Token.aggregate([
  { $match: { business: businessObjectId } },
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);

const durationStats = await ServiceHistory.aggregate([
  { $match: { business: businessObjectId } },
  { $group: {
      _id: null,
      avgWaitMins: { $avg: '$waitDurationMins' },
      avgServiceMins: { $avg: '$serviceDurationMins' }
  }}
]);`,
  },
  {
    id: 'socketio-realtime',
    title: '10. Real-Time WebSockets with Socket.IO',
    category: 'Real-Time',
    description: 'Bi-directional WebSocket communication with room partitioning for queues, businesses, and users.',
    code: `// Socket.IO Room Partitioning & Live Alerts
io.on('connection', (socket) => {
  socket.on('join_queue', (queueId) => socket.join(\`queue:\${queueId}\`));
  socket.on('subscribe_user', (userId) => socket.join(\`user:\${userId}\`));
});

export function broadcastQueueUpdate(queueId, data) {
  io.to(\`queue:\${queueId}\`).emit('queue_updated', data);
}`,
  },
];

export function JSShowcaseModal({ isOpen, onClose }) {
  const [selectedTopic, setSelectedTopic] = useState(SYLLABUS_TOPICS[0]);
  const [copied, setCopied] = useState(false);

  // ESC key listener to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(selectedTopic.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Back End Engineering Syllabus Code Showcase"
    >
      <div 
        className="glass-modal animate-slide-down"
        style={{
          width: '95%',
          maxWidth: '880px',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-indigo">
                <BookOpen size={14} /> Back End Engineering Coursework
              </span>
              <span className="badge badge-emerald">
                Syllabus to Code Mapping
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', marginTop: '0.3rem' }}>
              QueueLess Full-Stack Architecture Showcase
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '1.25rem',
          flexGrow: 1,
          overflow: 'hidden',
        }}>
          {/* Left Navigation Topics */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            overflowY: 'auto',
            paddingRight: '0.5rem',
          }}>
            {SYLLABUS_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                style={{
                  textAlign: 'left',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: selectedTopic.id === topic.id ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                  border: selectedTopic.id === topic.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  color: selectedTopic.id === topic.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: selectedTopic.id === topic.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {topic.title}
                </span>
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                  {topic.category}
                </span>
              </button>
            ))}
          </div>

          {/* Right Code Display */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '0.85rem 1rem',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h4 style={{ fontSize: '0.95rem' }}>{selectedTopic.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{selectedTopic.description}</p>
              </div>
              <button
                onClick={handleCopy}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                {copied ? '✓ Copied' : 'Copy Snippet'}
              </button>
            </div>

            <div style={{ padding: '1rem', overflowY: 'auto', flexGrow: 1, fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6 }}>
              <pre style={{ margin: 0, color: 'var(--text-primary)' }}>
                <code>{selectedTopic.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
