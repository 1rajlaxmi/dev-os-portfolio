if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Load single source of truth profile config
let profile = {
  name: 'Rajlaxmi Gupta',
  tagline: 'Full Stack Developer',
  role: 'Full Stack Developer Intern @ AIDEOA',
  github: 'https://github.com/1rajlaxmi/',
  linkedin: 'https://www.linkedin.com/in/rajlaxmi-cuh/',
  email: 'rajlaxmigupta@atomicmail.io',
};

try {
  const localProfilePath = path.join(__dirname, 'data/profile.json');
  const monorepoProfilePath = path.join(__dirname, '../dev-os/src/data/profile.json');
  const targetPath = fs.existsSync(localProfilePath) ? localProfilePath : monorepoProfilePath;
  if (fs.existsSync(targetPath)) {
    profile = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  }
} catch {
  // Use default fallback if running in standalone backend host
}

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim()),
}));
app.use(express.json());

// ─── VIRTUAL FILE SYSTEM ─────────────────────────────────────────────────────

const fileSystem = [
  {
    id: '1',
    name: 'README.md',
    type: 'file',
    parentId: null,
    content: `# Welcome to DevOS 👋

**DevOS** is an interactive, browser-based OS simulation built as a developer portfolio.

## About the Developer

**Name:** Rajlaxmi  
**Role:** Full Stack Developer Intern @ AIDEOA  
**Education:** MCA — Central University of Haryana  
**Location:** Patna, Bihar, India

## How to Navigate

- Use the **Dock** at the bottom to open apps
- Press **Ctrl+K** to open Spotlight Search
- Double-click files in the **Explorer** to read them
- Open the **Terminal** and type \`help\` for available commands
- Open **Projects** to see my work
- Open **Settings** to learn more about me & customize the wallpaper

---
*Built with React, TypeScript, Redux Toolkit, Node.js, and Express.*`,
  },
  {
    id: '2',
    name: 'Projects',
    type: 'folder',
    parentId: null,
    content: null,
  },
  {
    id: '3',
    name: 'RoomieOS.md',
    type: 'file',
    parentId: '2',
    content: `# RoomieOS

**Type:** Full-Stack Web Application  
**Stack:** React.js · Node.js · Express.js · MongoDB · Socket.io · JWT

## Overview

RoomieOS is a real-time room management dashboard designed for shared living environments. It enables tenants and owners to manage bookings, payments, and maintenance requests through a unified interface.

## Key Technical Achievements

### Real-Time Synchronization
- Engineered a **low-latency WebSocket layer** using Socket.io
- Dashboard updates reflect instantly across all connected clients without page refresh
- Handles concurrent connections with room-scoped event broadcasting

### Security & Auth
- Implemented **cookie-based JWT authentication** for persistent sessions
- Applied **API rate-limiting middleware** to prevent abuse
- Role-Based Access Control (RBAC): Tenant vs. Owner permissions

### Architecture
\`\`\`
Client (React) ←── WebSocket ──→ Node.js Server
                                      │
                              Express REST API
                                      │
                                MongoDB Atlas
\`\`\`

## Features
- Real-time dashboard updates
- Secure login/signup with JWT
- Tenant & Owner role management
- Payment tracking
- Maintenance request system`,
  },
  {
    id: '4',
    name: 'ChitChat.md',
    type: 'file',
    parentId: '2',
    content: `# Chit Chat App

**Type:** Real-Time Chat Application  
**Stack:** React.js · Node.js · Socket.io · MongoDB · Express.js

## Overview

A full-duplex, real-time messaging application enabling instant communication between users. Features persistent chat history, multiple chat rooms, and a clean responsive interface.

## Key Technical Achievements

### Real-Time Messaging
- Built with **Socket.io** for bidirectional event-based communication
- Sub-100ms message delivery in optimal network conditions
- Graceful connection/disconnection handling with user presence indicators

### Data Persistence
- Chat messages stored in **MongoDB** for history retrieval
- Efficient query design — only recent messages loaded on connect, older messages lazy-loaded

### Features
- User authentication
- Multiple chat rooms
- Typing indicators
- Message timestamps
- Responsive mobile-friendly UI`,
  },
  {
    id: '5',
    name: 'AIDEOA_Internship.md',
    type: 'file',
    parentId: '2',
    content: `# AIDEOA Internship

**Role:** Full Stack Developer Intern  
**Company:** AIDEOA  
**Duration:** Ongoing  
**Stack:** React.js · Node.js · Express.js · MongoDB · Tailwind CSS

## What I Built

### Frontend Development
- Built **responsive, accessible UIs** using React.js and Tailwind CSS
- Implemented complex form flows with validation and UX-friendly error handling
- Optimized component architecture for re-usability and performance

### Backend & API Development
- Designed and built **RESTful APIs** using Node.js and Express.js
- Implemented proper HTTP status codes, error handling middleware, and API versioning patterns

### Payment Gateway Integration
- Successfully integrated the **PayU Payment Gateway**
- Built a secure end-to-end transaction flow with webhook handling for payment status updates
- Implemented proper error recovery and user-facing feedback for failed transactions

### SEO Improvements
- Improved site-wide SEO using structured metadata (Open Graph, Twitter Cards, canonical URLs)
- Implemented dynamic \`<title>\` and \`<meta description>\` tags for all major routes
- Result: Better search engine indexability and social sharing previews`,
  },
  {
    id: '6',
    name: 'Skills.md',
    type: 'file',
    parentId: null,
    content: `# Technical Skills

## Frontend
| Technology | Proficiency |
|---|---|
| React.js | ████████████ Expert |
| Next.js | ██████████░░ Advanced |
| TypeScript | █████████░░░ Advanced |
| Tailwind CSS | ████████████ Expert |
| HTML5 / CSS3 | ████████████ Expert |

## Backend
| Technology | Proficiency |
|---|---|
| Node.js | ██████████░░ Advanced |
| Express.js | ██████████░░ Advanced |
| REST API Design | ████████████ Expert |
| Socket.io / WebSockets | █████████░░░ Advanced |
| JWT Authentication | ████████████ Expert |

## Database
| Technology | Proficiency |
|---|---|
| MongoDB | ██████████░░ Advanced |
| Mongoose ODM | ██████████░░ Advanced |

## Tools & Practices
- Git & GitHub — Version control, branching strategies
- Postman — API testing and documentation
- DSA — 400+ problems solved (GFG, HackerRank, LeetCode)
- PayU Payment Gateway Integration
- SEO Optimization`,
  },
  {
    id: '7',
    name: 'Achievements.md',
    type: 'file',
    parentId: null,
    content: `# Achievements & Competitive Programming

## Competitive Programming
- **400+ Problems Solved** across GeeksforGeeks, HackerRank, and LeetCode
- **AIR 5124** — CodingNinjas Codekaze Contest (National Level)
- **College Rank Under 45** — GeeksForGeeks (Institution Leaderboard)

## Education
- **Master of Computer Application (MCA)**  
  Central University of Haryana  

## Certifications & Highlights
- Full Stack Web Development
- Data Structures & Algorithms

---
*Consistent practice in problem-solving has built strong algorithmic thinking that directly benefits my development work.*`,
  },
  {
    id: '8',
    name: 'System_Config.json',
    type: 'file',
    parentId: null,
    content: `{
  "os": "DevOS Portfolio Edition v2.0",
  "kernel": "React 19 + Redux Toolkit",
  "shell": "DevOS Terminal v2.0 (Express Backend)",
  "window_manager": "Redux Window Manager",
  "filesystem": "Virtual File System (Express REST API)",
  "developer": {
    "name": "Rajlaxmi",
    "role": "Full Stack Developer Intern",
    "company": "AIDEOA",
    "location": "Patna, Bihar, India",
    "status": "open_to_opportunities"
  },
  "stack": {
    "frontend": ["React.js", "TypeScript", "Redux Toolkit", "Tailwind CSS", "Vite"],
    "backend": ["Node.js", "Express.js", "MongoDB", "Socket.io"],
    "auth": "JWT (cookie-based)",
    "realtime": "Socket.io WebSockets"
  }
}`,
  },
];

// ─── API ROUTES ───────────────────────────────────────────────────────────────

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'DevOS Backend is running!',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Contact Form Email Submission via Resend
app.post('/api/contact', async (req, res) => {
  const { name, subject, message, replyTo } = req.body || {};

  if (!name || !name.trim() || !message || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Name and message are required fields.',
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || profile.email;

  if (!apiKey) {
    console.warn('⚠️  RESEND_API_KEY not set in environment.');
    return res.status(535).json({
      success: false,
      error: 'Email service not configured. Set RESEND_API_KEY in server .env',
      unconfigured: true,
    });
  }

  try {
    const resend = new Resend(apiKey);

    const emailSubject = subject && subject.trim()
      ? `[DevOS Contact] ${subject.trim()}`
      : `[DevOS Contact] Message from ${name.trim()}`;

    const { error } = await resend.emails.send({
      from: 'DevOS Portfolio <onboarding@resend.dev>',
      to: [receiverEmail],
      reply_to: replyTo && replyTo.trim() ? replyTo.trim() : undefined,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f0f0f; color: #e5e7eb; border-radius: 12px; border: 1px solid #1f2937;">
          <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="margin: 0; color: #818cf8; font-size: 20px;">📬 New Message via DevOS Portfolio</h1>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="color: #6b7280; padding: 6px 0; width: 90px;">From</td><td style="color: #f3f4f6; font-weight: 600;">${name.trim()}</td></tr>
            <tr><td style="color: #6b7280; padding: 6px 0;">Reply-To</td><td style="color: #818cf8;">${replyTo ? replyTo.trim() : 'Not provided'}</td></tr>
            <tr><td style="color: #6b7280; padding: 6px 0;">Subject</td><td style="color: #f3f4f6;">${subject ? subject.trim() : '—'}</td></tr>
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #1a1a2e; border-radius: 8px; border-left: 3px solid #4f46e5;">
            <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.7; color: #d1d5db;">${message.trim()}</p>
          </div>
          <p style="margin-top: 20px; font-size: 11px; color: #4b5563; text-align: center;">Sent from DevOS Portfolio Contact Form</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log(`✅ Contact email sent to ${receiverEmail} via Resend`);
    res.json({ success: true, message: 'Email sent successfully via Resend!' });
  } catch (err) {
    console.error('Contact route error:', err);
    res.status(500).json({
      success: false,
      error: 'Unexpected server error while sending email.',
      details: err.message,
    });
  }
});

// Get all files/folders (metadata only, no content)
app.get('/api/files', (req, res) => {
  const tree = fileSystem.map(({ content, ...meta }) => meta);
  res.json(tree);
});

// Get a specific file's content
app.get('/api/files/:id', (req, res) => {
  const file = fileSystem.find((f) => f.id === req.params.id);
  if (file && file.type === 'file') {
    res.json({ content: file.content });
  } else {
    res.status(404).json({ error: 'File not found in Virtual File System' });
  }
});

// Terminal Command Execution
app.post('/api/terminal/execute', (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ output: 'No command provided.' });

  const cmd = command.trim();
  const lowerCmd = cmd.toLowerCase();
  const parts = cmd.split(/\s+/);
  const verb = parts[0].toLowerCase();

  // ── Built-in commands ─────────────────────────────────────────────

  if (lowerCmd === 'help') {
    return res.json({
      output: `
DevOS Terminal v2.5 — Available Commands
─────────────────────────────────────────
whoami       Show developer identity
about        Show full bio
skills       List tech stack by category
projects     List all projects
achievements Show contest & DSA stats
social       Show contact & social links
tour         Start Recruiter 1-Click Guided Tour
dsa          Open DSA Dashboard
sfx [on|off] Enable or disable sound effects
ls           List root directory contents
ls <folder>  List folder contents (e.g. ls Projects)
cat <file>   Print file content (e.g. cat README.md)
ping         Test server connection latency
date         Show server timestamp
open <app>   Open an app (terminal/browser/projects/contact/resume/settings/dsa/notes/explorer)
clear        Clear the terminal screen
help         Show this menu
─────────────────────────────────────────
      `.trim(),
    });
  }

  if (verb === 'sfx') {
    const arg = (parts[1] || '').toLowerCase();
    if (arg === 'on' || arg === 'enable' || arg === '1') {
      return res.json({ output: '[SFX] Sound effects ENABLED 🔊' });
    } else if (arg === 'off' || arg === 'disable' || arg === '0' || arg === 'mute') {
      return res.json({ output: '[SFX] Sound effects DISABLED 🔇' });
    } else if (arg === 'toggle') {
      return res.json({ output: '[SFX] Sound effects toggled.' });
    }
    return res.json({ output: 'SFX CLI Control\nUsage: sfx on | sfx off | sfx toggle | sfx status' });
  }

  if (lowerCmd === 'tour') {
    return res.json({ output: '__START_TOUR__' });
  }

  if (lowerCmd === 'dsa') {
    return res.json({ output: '__OPEN_APP__:dsa' });
  }


  if (lowerCmd === 'whoami') {
    return res.json({
      output: `Rajlaxmi — Full Stack Developer
Role   : Full Stack Developer Intern @ AIDEOA
Edu    : MCA — Central University of Haryana
Stack  : React · Node.js · MongoDB · Socket.io · TypeScript
Status : Open to full-time opportunities`,
    });
  }

  if (lowerCmd === 'about') {
    return res.json({
      output: `A passionate Full Stack Developer who loves building robust,
scalable web applications. Currently interning at AIDEOA,
crafting real-time systems and intuitive UIs.

Strong in DSA with 400+ problems solved across competitive
platforms. Always learning, always building.

Type "projects" to see my work, or "social" for contact info.`,
    });
  }

  if (lowerCmd === 'skills') {
    return res.json({
      output: `
Frontend : React.js · Next.js · TypeScript · Tailwind CSS
Backend  : Node.js · Express.js · REST APIs · WebSockets
Database : MongoDB · Mongoose ODM
Auth     : JWT (cookie-based) · API Rate Limiting
Realtime : Socket.io · Event-Driven Architecture
Tools    : Git · GitHub · Postman · Vite
DSA      : 400+ problems (GFG · HackerRank · LeetCode)
      `.trim(),
    });
  }

  if (lowerCmd === 'projects') {
    return res.json({
      output: `
┌─────────────────────────────────────────────────┐
│  RoomieOS     │ Real-time room mgmt + WebSockets │
│  ChitChat App │ Full-duplex chat with Socket.io  │
│  AIDEOA Work  │ PayU Gateway, REST APIs, SEO     │
│  DevOS        │ This portfolio OS (you're in it!)│
└─────────────────────────────────────────────────┘
Type: open projects  — to open the Projects app
      `.trim(),
    });
  }

  if (lowerCmd === 'achievements') {
    return res.json({
      output: `
Competitive Programming
  ✦ 400+ Problems Solved (GFG · HackerRank · LeetCode)
  ✦ AIR 5124 — CodingNinjas Codekaze (National Contest)
  ✦ College Rank Under 45 — GeeksForGeeks

Education
  ✦ MCA — Central University of Haryana
      `.trim(),
    });
  }

  if (lowerCmd === 'social') {
    return res.json({
      output: `
Contact & Social Links
─────────────────────────────────────────
GitHub   : ${profile.github}
LinkedIn : ${profile.linkedin}
Email    : ${profile.email}
─────────────────────────────────────────
Type: open contact  — to open the Contact app
      `.trim(),
    });
  }

  if (lowerCmd === 'ping') {
    return res.json({ output: '__PING_RESPONSE__' }); // latency injected client-side
  }

  if (lowerCmd === 'date') {
    return res.json({ output: `Server Time: ${new Date().toString()}` });
  }

  // ── ls command ────────────────────────────────────────────────────
  if (verb === 'ls') {
    const targetName = parts[1] || null;
    let items;
    if (!targetName) {
      items = fileSystem.filter((f) => f.parentId === null);
    } else {
      const folder = fileSystem.find(
        (f) => f.type === 'folder' && f.name.toLowerCase() === targetName.toLowerCase()
      );
      if (!folder) {
        return res.json({ output: `ls: ${targetName}: No such file or directory` });
      }
      items = fileSystem.filter((f) => f.parentId === folder.id);
    }
    const lines = items.map((f) => (f.type === 'folder' ? `📁 ${f.name}/` : `📄 ${f.name}`));
    return res.json({ output: lines.join('\n') || '(empty directory)' });
  }

  // ── cat command ───────────────────────────────────────────────────
  if (verb === 'cat') {
    const fileName = parts.slice(1).join(' ');
    if (!fileName) return res.json({ output: 'Usage: cat <filename>' });
    const file = fileSystem.find(
      (f) => f.type === 'file' && f.name.toLowerCase() === fileName.toLowerCase()
    );
    if (!file) return res.json({ output: `cat: ${fileName}: No such file` });
    // Strip markdown for terminal display
    const plain = file.content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ''))
      .replace(/\|[^\n]+\|/g, (m) => m)
      .trim();
    return res.json({ output: plain });
  }

  // ── open command (handled client-side but acknowledged server-side) ──
  if (verb === 'open') {
    const target = parts[1];
    if (!target) return res.json({ output: 'Usage: open <appname>\nApps: terminal, browser, projects, contact, resume, settings, dsa, notes, explorer' });
    return res.json({ output: `__OPEN_APP__:${target}` }); // parsed client-side
  }

  // ── Default ───────────────────────────────────────────────────────
  return res.json({ output: `devos: command not found: ${command}\nType "help" for available commands.` });
});

// ─── ADMIN AUTHENTICATION & CRUD API ENDPOINTS ────────────────────────────────
let inMemoryProjects = [
  { id: 'roomieos', title: 'RoomieOS', description: 'Real-time room management dashboard...', tech: ['React.js', 'Node.js', 'Socket.io'] },
  { id: 'chitchat', title: 'Chit Chat App', description: 'Full-duplex chat application...', tech: ['React.js', 'Node.js', 'Socket.io'] },
];

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === expectedPassword) {
    return res.json({ success: true, message: 'Admin authentication successful', token: 'devos-admin-session-token' });
  }
  return res.status(401).json({ success: false, error: 'Invalid master password' });
});

app.get('/api/projects', (req, res) => {
  res.json(inMemoryProjects);
});

app.post('/api/projects', (req, res) => {
  const newProject = { id: `proj-${Date.now()}`, ...req.body };
  inMemoryProjects.unshift(newProject);
  res.json({ success: true, project: newProject });
});

// ─── SOCKET.IO — Real-time Visitor Counter ───────────────────────────────────
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim()), methods: ['GET', 'POST'] },
});

let visitorCount = 0;

io.on('connection', (socket) => {
  visitorCount++;
  io.emit('visitor_count', visitorCount);

  socket.on('disconnect', () => {
    visitorCount = Math.max(0, visitorCount - 1);
    io.emit('visitor_count', visitorCount);
  });
});

// Start Server only if run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`🚀 DevOS Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}/api/health`);
    console.log(`======================================\n`);
  });
}

module.exports = app;