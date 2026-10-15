import { useState } from 'react';
import {
  Database,
  Server,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  ArrowRight,
  Radio,
  Lock,
  CreditCard,
  Search,
} from 'lucide-react';

interface TierNode {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  tech: string[];
  color: string;
  badge: string;
  details: string;
}

interface ProjectArch {
  title: string;
  type: string;
  nodes: TierNode[];
  connections: { from: string; to: string; label: string; protocol: string }[];
}

const ARCHITECTURE_DATA: Record<string, ProjectArch> = {
  roomieos: {
    title: 'RoomieOS System Architecture',
    type: 'Full-Stack Real-Time Micro-Dashboard',
    nodes: [
      {
        id: 'client',
        name: 'Client Interface',
        role: 'React Single Page App',
        icon: Globe,
        tech: ['React 19', 'Redux Toolkit', 'Tailwind CSS'],
        color: 'from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-blue-400',
        badge: 'Frontend',
        details: 'Responsive dashboard UI with interactive tenant & owner modules, real-time widget rendering.',
      },
      {
        id: 'auth',
        name: 'Security & Auth Middleware',
        role: 'Session & Rate Guard',
        icon: Lock,
        tech: ['Cookie JWT', 'Rate Limiter', 'RBAC'],
        color: 'from-purple-600/20 to-pink-600/20 border-purple-500/30 text-purple-400',
        badge: 'Security',
        details: 'HttpOnly cookie JWT authentication with role-based access control and rate limiting middleware.',
      },
      {
        id: 'server',
        name: 'Node.js Express Engine',
        role: 'REST Controller & Business Logic',
        icon: Server,
        tech: ['Node.js', 'Express.js', 'Mongoose'],
        color: 'from-green-600/20 to-emerald-600/20 border-green-500/30 text-green-400',
        badge: 'Backend',
        details: 'Modular REST API endpoints for room bookings, payment tracking, and user management.',
      },
      {
        id: 'realtime',
        name: 'Socket.io WebSocket Layer',
        role: 'Low-Latency Event Bus',
        icon: Radio,
        tech: ['Socket.io', 'Room Scoping'],
        color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400',
        badge: 'Realtime',
        details: 'Sub-100ms bidirectional event emitter delivering instant updates across connected tenants.',
      },
      {
        id: 'database',
        name: 'MongoDB Atlas',
        role: 'Document Storage',
        icon: Database,
        tech: ['MongoDB', 'Mongoose ODM', 'Index Optimization'],
        color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400',
        badge: 'Database',
        details: 'Persistent collection database for users, rooms, maintenance requests, and payment logs.',
      },
    ],
    connections: [
      { from: 'client', to: 'auth', label: 'HTTP / Cookies', protocol: 'REST / HTTPS' },
      { from: 'auth', to: 'server', label: 'Validated Request', protocol: 'Express Middleware' },
      { from: 'server', to: 'realtime', label: 'Emit Events', protocol: 'Socket.io Bridge' },
      { from: 'server', to: 'database', label: 'Queries & Aggregations', protocol: 'Mongoose Driver' },
    ],
  },

  chitchat: {
    title: 'ChitChat Messaging Architecture',
    type: 'Full-Duplex Real-Time Communication System',
    nodes: [
      {
        id: 'client',
        name: 'Chat Client UI',
        role: 'Responsive Messaging Web App',
        icon: Globe,
        tech: ['React.js', 'Lucide React', 'CSS3 Transitions'],
        color: 'from-teal-600/20 to-emerald-600/20 border-teal-500/30 text-teal-400',
        badge: 'Frontend',
        details: 'Clean chat UI supporting room selection, typing indicators, and optimistic message rendering.',
      },
      {
        id: 'socket',
        name: 'Socket.io Core',
        role: 'Full-Duplex Gateway',
        icon: Radio,
        tech: ['Socket.io Server', 'Rooms API', 'Handshake Auth'],
        color: 'from-cyan-600/20 to-blue-600/20 border-cyan-500/30 text-cyan-400',
        badge: 'WebSockets',
        details: 'Manages socket connections, room channels, presence status, and instant payload broadcast.',
      },
      {
        id: 'api',
        name: 'Express Backend API',
        role: 'User Auth & Room State',
        icon: Server,
        tech: ['Express.js', 'Node.js', 'Bcrypt.js'],
        color: 'from-indigo-600/20 to-violet-600/20 border-indigo-500/30 text-indigo-400',
        badge: 'Server',
        details: 'Handles user authentication, room creation, and legacy history fetching.',
      },
      {
        id: 'database',
        name: 'MongoDB Persistent Store',
        role: 'Message History & Users',
        icon: Database,
        tech: ['MongoDB', 'Indexed Message Collections'],
        color: 'from-emerald-600/20 to-green-600/20 border-emerald-500/30 text-emerald-400',
        badge: 'Database',
        details: 'Stores chat messages with timestamps and indexed room IDs for rapid lazy loading.',
      },
    ],
    connections: [
      { from: 'client', to: 'socket', label: 'WebSocket Handshake', protocol: 'WSS / WS' },
      { from: 'socket', to: 'api', label: 'Auth Validation', protocol: 'Internal Service Call' },
      { from: 'socket', to: 'database', label: 'Async Message Logging', protocol: 'Mongoose ODM' },
    ],
  },

  'aideoa-work': {
    title: 'AIDEOA Full-Stack & Payment Architecture',
    type: 'Enterprise Intern Web System & PayU Gateway',
    nodes: [
      {
        id: 'client',
        name: 'Accessible Web Portal',
        role: 'Dynamic React Interface',
        icon: Globe,
        tech: ['React.js', 'Tailwind CSS', 'Structured Metadata'],
        color: 'from-orange-600/20 to-amber-600/20 border-orange-500/30 text-orange-400',
        badge: 'Frontend UI',
        details: 'Custom responsive web portal with input validation, accessible components, and SEO meta tags.',
      },
      {
        id: 'payu',
        name: 'PayU Payment Gateway',
        role: 'Payment Transaction Engine',
        icon: CreditCard,
        tech: ['PayU SDK', 'SHA-512 Hash Check', 'Webhooks'],
        color: 'from-red-600/20 to-rose-600/20 border-red-500/30 text-red-400',
        badge: 'Payment Gateway',
        details: 'Secure checkout workflow handling credit/debit/UPI payments with cryptographic hash validation.',
      },
      {
        id: 'api',
        name: 'Express API & Webhook Listener',
        role: 'Backend Services',
        icon: Server,
        tech: ['Node.js', 'Express.js', 'Custom Middleware'],
        color: 'from-yellow-600/20 to-amber-600/20 border-yellow-500/30 text-yellow-400',
        badge: 'Backend API',
        details: 'Processes incoming payment verification callbacks and updates platform records.',
      },
      {
        id: 'seo',
        name: 'SEO & Metadata Engine',
        role: 'Search Optimization',
        icon: Search,
        tech: ['Open Graph', 'Twitter Cards', 'Dynamic Titles'],
        color: 'from-indigo-600/20 to-purple-600/20 border-indigo-500/30 text-indigo-400',
        badge: 'SEO',
        details: 'Injects dynamic routes metadata, canonical tags, and preview cards for indexability.',
      },
    ],
    connections: [
      { from: 'client', to: 'api', label: 'Submit Form / Initiate Order', protocol: 'HTTPS REST' },
      { from: 'api', to: 'payu', label: 'Encrypted Payment Payload', protocol: 'PayU Hash Spec' },
      { from: 'payu', to: 'api', label: 'Payment Status Webhook', protocol: 'Server Callback' },
    ],
  },

  devos: {
    title: 'DevOS Simulation Architecture',
    type: 'Browser OS Operating System & Virtual File System',
    nodes: [
      {
        id: 'ui',
        name: 'Window Manager & Desktop UI',
        role: 'React Desktop & App Canvas',
        icon: Layers,
        tech: ['React 19', 'Framer Motion', 'Tailwind CSS v4'],
        color: 'from-cyan-600/20 to-blue-600/20 border-cyan-500/30 text-cyan-400',
        badge: 'UI Engine',
        details: 'Coordinates window z-index layering, taskbar minimization, shortcut desktop icons, and Spotlight.',
      },
      {
        id: 'kernel',
        name: 'Redux Kernel State',
        role: 'Global State Management',
        icon: Cpu,
        tech: ['Redux Toolkit', 'Slice Architecture'],
        color: 'from-purple-600/20 to-indigo-600/20 border-purple-500/30 text-purple-400',
        badge: 'State Kernel',
        details: 'Centralized state for window instances, VFS file tree, theme settings, and admin session.',
      },
      {
        id: 'graphics',
        name: 'Three.js 3D WebGL Matrix',
        role: 'GPU Canvas Renderer',
        icon: Zap,
        tech: ['Three.js', 'CanvasTexture', 'Parallax'],
        color: 'from-emerald-600/20 to-green-600/20 border-emerald-500/30 text-emerald-400',
        badge: 'WebGL',
        details: 'Interactive 3D particle canvas streaming binary data, tech keywords, and mouse position parallax.',
      },
      {
        id: 'server',
        name: 'Express Backend & Terminal Exec',
        role: 'Remote Backend Server',
        icon: Server,
        tech: ['Node.js', 'Express.js', 'Socket.io'],
        color: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-400',
        badge: 'Backend Server',
        details: 'Serves virtual file payloads, executes terminal shell commands, and broadcasts live visitor metrics.',
      },
    ],
    connections: [
      { from: 'ui', to: 'kernel', label: 'Dispatch Actions', protocol: 'Redux Store' },
      { from: 'ui', to: 'graphics', label: 'Mouse Orbit Events', protocol: 'WebGL Frame Loop' },
      { from: 'ui', to: 'server', label: 'Terminal Commands & VFS', protocol: 'REST / Socket.io' },
    ],
  },
};

export const ArchitectureDiagram = ({ projectId }: { projectId: string }) => {
  const arch = ARCHITECTURE_DATA[projectId] || ARCHITECTURE_DATA['roomieos'];
  const [activeNode, setActiveNode] = useState<TierNode | null>(arch.nodes[0] || null);

  return (
    <div className="flex flex-col gap-5 p-1 font-sans">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" />
            <h4 className="text-sm font-semibold text-white">{arch.title}</h4>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{arch.type}</p>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold font-mono">
          Interactive Architecture
        </span>
      </div>

      {/* Visual Tiers / Nodes Grid */}
      <div>
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
          <Cpu size={13} />
          System Tiers & Components (Click to Inspect)
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {arch.nodes.map((node) => {
            const Icon = node.icon;
            const isSelected = activeNode?.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`text-left p-3.5 rounded-xl border bg-gradient-to-br transition-all duration-200 cursor-pointer ${node.color} ${
                  isSelected ? 'ring-2 ring-indigo-400/80 shadow-lg shadow-indigo-900/40 scale-[1.01]' : 'hover:brightness-110'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{node.name}</div>
                      <div className="text-[11px] text-gray-300">{node.role}</div>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/50 text-gray-300 font-mono font-semibold border border-white/10">
                    {node.badge}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {node.tech.map((t) => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-gray-300 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Node Detail Card */}
      {activeNode && (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-400" />
              <span className="font-bold text-white">{activeNode.name} Deep Dive</span>
            </div>
            <span className="text-[10px] text-indigo-300 font-mono">{activeNode.role}</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{activeNode.details}</p>
        </div>
      )}

      {/* Data Flow Connections */}
      <div>
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
          <Zap size={13} />
          Data Flow & Protocols
        </h5>
        <div className="space-y-2">
          {arch.connections.map((conn, idx) => {
            const fromNode = arch.nodes.find((n) => n.id === conn.from);
            const toNode = arch.nodes.find((n) => n.id === conn.to);
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/4 border border-white/8 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-gray-200 truncate">{fromNode?.name}</span>
                  <ArrowRight size={12} className="text-indigo-400 shrink-0" />
                  <span className="font-bold text-gray-200 truncate">{toNode?.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[10px] text-gray-400">{conn.label}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 font-semibold">
                    {conn.protocol}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
