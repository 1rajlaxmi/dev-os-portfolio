import { createSlice } from '@reduxjs/toolkit';
import type { VFSNode } from '../../types/vfs';

const MOCK_FS: VFSNode[] = [
  { id: 'root',      name: 'Home',      type: 'folder', parentId: null,       icon: 'folder' },
  { id: 'projects',  name: 'Projects',  type: 'folder', parentId: 'root',     icon: 'folder' },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'root',     icon: 'folder' },
  { id: 'snippets',  name: 'Code Snippets', type: 'folder', parentId: 'root', icon: 'folder' },
  { id: 'assets',    name: 'Assets',    type: 'folder', parentId: 'root',     icon: 'folder' },
  { id: 'p1',        name: 'PULSE_NET', type: 'folder', parentId: 'projects', icon: 'folder' },
  {
    id: 'f1',
    name: 'TimeDecay_Algo.md',
    type: 'file',
    parentId: 'p1',
    icon: 'code',
    appId: 'notes',
    content:
      '# PULSE_NET Architecture\n\n## Time-Decay Algorithm\nThe core of the feed ranking uses a custom time-decay heuristic to ensure older posts gradually lose visibility unless they maintain high engagement.\n\n### Tech Stack\n* **Frontend:** React 19 + TypeScript\n* **Backend:** Java Spring Boot\n* **Database:** PostgreSQL\n\n> This project was developed during my time at CStech.ai.',
  },
  {
    id: 'f3',
    name: 'CStech_Internship.md',
    type: 'file',
    parentId: 'documents',
    icon: 'document',
    appId: 'notes',
    content:
      '# Internship Log: CStech.ai\n\n**Role:** Web Developer Intern\n**Location:** Pune\n\n## Key Learnings\n1. Architected scalable RBAC (Role-Based Access Control) systems for Tenant-Owner hierarchies.\n2. Mastered production-level React structuring and component composition.\n3. Collaborated with senior engineers to optimize PostgreSQL queries.',
  },
  // ── Real Code Snippets ──────────────────────────────────────────────────────
  {
    id: 'snip-socket',
    name: 'SocketIO_Handler.js',
    type: 'file',
    parentId: 'snippets',
    icon: 'code',
    appId: 'notes',
    content: `# Socket.io Connection Handler — RoomieOS

Real-time WebSocket layer from the RoomieOS room management dashboard. Handles bidirectional events with room-scoped broadcasting.

\`\`\`javascript
// server/socket.js — RoomieOS Real-Time Engine
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // JWT Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role, roomId } = socket.user;
    console.log(\`✅ \${role} connected: \${userId}\`);

    // Join their specific room namespace
    socket.join(\`room:\${roomId}\`);

    // Broadcast dashboard update to everyone in the room
    socket.on('maintenance:update', (data) => {
      io.to(\`room:\${roomId}\`).emit('maintenance:updated', {
        ...data,
        updatedBy: userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Payment status change — notify owner
    socket.on('payment:confirmed', ({ tenantId, amount }) => {
      io.to(\`room:\${roomId}\`).emit('payment:new', { tenantId, amount });
    });

    socket.on('disconnect', () => {
      console.log(\`❌ \${role} disconnected: \${userId}\`);
    });
  });
};
\`\`\`

**Time Complexity:** O(1) per event emit  
**Pattern:** Room-scoped broadcasting avoids cross-room leakage
`,
  },
  {
    id: 'snip-jwt',
    name: 'JWT_Middleware.js',
    type: 'file',
    parentId: 'snippets',
    icon: 'code',
    appId: 'notes',
    content: `# JWT Authentication Middleware

Cookie-based JWT auth middleware used across RoomieOS and ChitChat. Implements RBAC (Role-Based Access Control) for Tenant vs Owner routes.

\`\`\`javascript
// middleware/auth.js — JWT Cookie Auth + RBAC
const jwt = require('jsonwebtoken');

// Verify JWT from httpOnly cookie
const protect = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Handle expiry separately for better UX
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }
    return res.status(401).json({ message: 'Token invalid' });
  }
};

// Role-based authorization factory
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: \`Role '\${req.user.role}' is not authorized to access this route\`,
      });
    }
    next();
  };
};

// Usage:
// router.get('/dashboard', protect, authorize('owner'), getDashboard);
// router.post('/request', protect, authorize('tenant'), createRequest);

module.exports = { protect, authorize };
\`\`\`

**Security Features:**
- httpOnly cookie (prevents XSS token theft)
- Separate handling for expired vs invalid tokens
- Role-based route protection (Tenant / Owner)
`,
  },
  {
    id: 'snip-payu',
    name: 'PayU_Webhook.js',
    type: 'file',
    parentId: 'snippets',
    icon: 'code',
    appId: 'notes',
    content: `# PayU Payment Gateway Integration — AIDEOA

Built during my internship at AIDEOA. Handles the full PayU transaction lifecycle including hash verification and webhook processing.

\`\`\`javascript
// controllers/payment.js — PayU Gateway Integration
const crypto = require('crypto');

// Generate PayU hash for transaction integrity
const generateHash = (params) => {
  const { key, txnid, amount, productinfo, firstname, email } = params;
  const hashString = \`\${key}|\${txnid}|\${amount}|\${productinfo}|\${firstname}|\${email}|||||||||||\${process.env.PAYU_SALT}\`;

  return crypto.createHash('sha512').update(hashString).digest('hex');
};

// Initiate payment — returns form data for PayU redirect
const initiatePayment = async (req, res) => {
  const { amount, productinfo, firstname, email } = req.body;

  const txnid = \`TXN\${Date.now()}\`;
  const hashParams = {
    key: process.env.PAYU_KEY,
    txnid,
    amount: parseFloat(amount).toFixed(2),
    productinfo,
    firstname,
    email,
  };

  const hash = generateHash(hashParams);

  res.json({
    key: process.env.PAYU_KEY,
    txnid,
    hash,
    surl: \`\${process.env.BASE_URL}/api/payment/success\`,
    furl: \`\${process.env.BASE_URL}/api/payment/failure\`,
    ...hashParams,
  });
};

// Webhook — PayU posts payment status here
const paymentWebhook = async (req, res) => {
  const { txnid, status, hash, amount } = req.body;

  // Verify reverse hash to prevent tampering
  const reverseHashString = \`\${process.env.PAYU_SALT}|\${status}|||||||||||\${req.body.email}|\${req.body.firstname}|\${req.body.productinfo}|\${amount}|\${txnid}|\${process.env.PAYU_KEY}\`;
  const computedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

  if (computedHash !== hash) {
    return res.status(400).json({ message: 'Hash verification failed' });
  }

  if (status === 'success') {
    await Order.findOneAndUpdate({ txnid }, { status: 'paid', paidAt: new Date() });
  }

  res.redirect(status === 'success' ? '/payment/success' : '/payment/failure');
};

module.exports = { initiatePayment, paymentWebhook };
\`\`\`

**Security:** Reverse hash verification prevents payment tampering  
**Flow:** Client → initiate → PayU redirect → Webhook callback → DB update
`,
  },
];

interface VFSState {
  files: VFSNode[];
}

const initialState: VFSState = {
  files: MOCK_FS,
};

export const vfsSlice = createSlice({
  name: 'vfs',
  initialState,
  reducers: {},
});

export default vfsSlice.reducer;