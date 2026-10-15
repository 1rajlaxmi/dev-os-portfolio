const request = require('supertest');
const app = require('../index');

describe('DevOS Server REST API Endpoints', () => {
  // ── Health ────────────────────────────────────────────────────────────────

  describe('GET /api/health', () => {
    it('should return status 200 and online status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('message', 'DevOS Backend is running!');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // ── VFS File System ───────────────────────────────────────────────────────

  describe('GET /api/files', () => {
    it('should return list of virtual files metadata', async () => {
      const response = await request(app).get('/api/files');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return metadata without content field (content is stripped)', async () => {
      const response = await request(app).get('/api/files');
      const firstItem = response.body[0];
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('type');
      expect(firstItem).not.toHaveProperty('content');
    });

    it('should include both files and folders in the file list', async () => {
      const response = await request(app).get('/api/files');
      const types = response.body.map((f) => f.type);
      expect(types).toContain('file');
      expect(types).toContain('folder');
    });
  });

  describe('GET /api/files/:id', () => {
    it('should return content for README.md (id=1)', async () => {
      const response = await request(app).get('/api/files/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('Welcome to DevOS');
    });

    it('should return content for a project file (id=3)', async () => {
      const response = await request(app).get('/api/files/3');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('RoomieOS');
    });

    it('should return 404 for a folder ID (folders have no content)', async () => {
      const response = await request(app).get('/api/files/2'); // id=2 is the Projects folder
      expect(response.status).toBe(404);
    });

    it('should return 404 for a non-existent file ID', async () => {
      const response = await request(app).get('/api/files/nonexistent_id');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'File not found in Virtual File System');
    });
  });

  // ── Terminal Commands ─────────────────────────────────────────────────────

  describe('POST /api/terminal/execute', () => {
    it('should return help output for "help" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'help' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('DevOS Terminal v2.5');
    });

    it('help command should NOT mention "activity" (removed)', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'help' });
      expect(response.body.output).not.toContain('activity     Open Activity');
    });

    it('help command should list sfx command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'help' });
      expect(response.body.output).toContain('sfx [on|off]');
    });

    it('should handle "sfx on" and "sfx off" server commands', async () => {
      const onRes = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'sfx on' });
      expect(onRes.body.output).toContain('ENABLED');

      const offRes = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'sfx off' });
      expect(offRes.body.output).toContain('DISABLED');
    });

    it('should return developer details for "whoami" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'whoami' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('Rajlaxmi');
      expect(response.body.output).toContain('Full Stack Developer');
    });

    it('should return about bio for "about" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'about' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('AIDEOA');
    });

    it('should return skills for "skills" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'skills' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('React.js');
      expect(response.body.output).toContain('Node.js');
    });

    it('should return projects list for "projects" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'projects' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('RoomieOS');
      expect(response.body.output).toContain('ChitChat');
    });

    it('should return achievements for "achievements" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'achievements' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('400+');
      expect(response.body.output).toContain('AIR 5124');
    });

    it('should return social links for "social" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'social' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('github.com');
      expect(response.body.output).toContain('linkedin.com');
    });

    it('should return server time for "date" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'date' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('Server Time:');
    });

    it('should return __PING_RESPONSE__ for "ping" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'ping' });
      expect(response.status).toBe(200);
      expect(response.body.output).toBe('__PING_RESPONSE__');
    });

    it('should return __START_TOUR__ for "tour" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'tour' });
      expect(response.status).toBe(200);
      expect(response.body.output).toBe('__START_TOUR__');
    });

    it('should return __OPEN_APP__:dsa for "dsa" command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'dsa' });
      expect(response.status).toBe(200);
      expect(response.body.output).toBe('__OPEN_APP__:dsa');
    });

    it('"activity" command should no longer exist (removed) and return not found', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'activity' });
      expect(response.status).toBe(200);
      // activity command was removed, so it falls through to "command not found"
      expect(response.body.output).toContain('command not found');
    });

    // ── ls command ──────────────────────────────────────────────────────────

    it('ls: should list root directory contents', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'ls' });
      expect(response.status).toBe(200);
      // Root level includes README.md, Projects folder, Skills.md, etc.
      expect(response.body.output).toContain('📄 README.md');
      expect(response.body.output).toContain('📁 Projects/');
    });

    it('ls Projects: should list items inside Projects folder', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'ls Projects' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('📄');
    });

    it('ls: case-insensitive folder name matching', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'ls projects' }); // lowercase
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('📄');
    });

    it('ls <nonexistent>: should return error message', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'ls doesnotexist' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('No such file or directory');
    });

    // ── cat command ─────────────────────────────────────────────────────────

    it('cat README.md: should return README file content', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'cat README.md' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('Welcome to DevOS');
    });

    it('cat Skills.md: should return skills file content', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'cat Skills.md' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('React.js');
    });

    it('cat <nonexistent>: should return error message', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'cat ghost.txt' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('No such file');
    });

    it('cat without filename: should return usage hint', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'cat' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('Usage: cat');
    });

    // ── open command ─────────────────────────────────────────────────────────

    it('open browser: should return __OPEN_APP__:browser', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'open browser' });
      expect(response.status).toBe(200);
      expect(response.body.output).toBe('__OPEN_APP__:browser');
    });

    it('open without args: should return usage hint with updated app list', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'open' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('Usage: open');
      // Should NOT list "activity" since it's been removed
      expect(response.body.output).not.toContain('activity');
    });

    // ── Error handling ───────────────────────────────────────────────────────

    it('should return 400 if no command is provided', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.output).toBe('No command provided.');
    });

    it('should return command not found for unknown commands', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .send({ command: 'invalidcommand_xyz' });
      expect(response.status).toBe(200);
      expect(response.body.output).toContain('devos: command not found');
    });
  });

  // ── Contact API ───────────────────────────────────────────────────────────

  describe('POST /api/contact', () => {
    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({ message: 'Hello from test' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Name and message are required fields.');
    });

    it('should return 400 if message is missing', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({ name: 'Test User' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Name and message are required fields.');
    });

    it('should return 400 if name is empty string', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({ name: '   ', message: 'Hello' });
      expect(response.status).toBe(400);
    });

    it('should return 535 unconfigured state when RESEND_API_KEY is not set', async () => {
      const origKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;
      try {
        const response = await request(app)
          .post('/api/contact')
          .send({ name: 'Test User', message: 'Hello from test' });
        expect(response.status).toBe(535);
        expect(response.body.unconfigured).toBe(true);
      } finally {
        if (origKey !== undefined) process.env.RESEND_API_KEY = origKey;
      }
    });
  });

  // ── Admin & Projects API ──────────────────────────────────────────────────

  describe('POST /api/admin/login', () => {
    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ password: 'wrongpassword' });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return success with default password "admin123"', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ password: 'admin123' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('GET /api/projects', () => {
    it('should return a list of projects', async () => {
      const response = await request(app).get('/api/projects');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return projects with id and title fields', async () => {
      const response = await request(app).get('/api/projects');
      const project = response.body[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('title');
    });
  });
});
