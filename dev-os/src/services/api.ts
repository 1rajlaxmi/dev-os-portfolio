// Single source of truth for all API calls to the backend.
// Explorer and Notes now read from Redux VFS, so only terminal calls remain.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiService = {
  /** Execute a terminal command on the backend Express server */
  executeTerminalCommand: async (command: string) => {
    const response = await fetch(`${BASE_URL}/terminal/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json() as Promise<{ output: string }>;
  },

  /** Send contact message via Nodemailer backend API */
  sendContactMessage: async (payload: { name: string; subject?: string; message: string; replyTo?: string }) => {
    const response = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  },
};