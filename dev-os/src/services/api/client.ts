// Dummy Data (Moves to MongoDB later)
const MOCK_FILESYSTEM = [
  { id: '1', name: 'projects', type: 'directory', parentId: 'root' },
  { id: '2', name: 'ResumeRajlaxmi_2026.pdf', type: 'file', parentId: 'root', appId: 'resume' },
  { id: '3', name: 'devos.md', type: 'file', parentId: '1', appId: 'notes' }
];

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const apiClient = {
  fileSystem: {
    fetchInitialTree: async () => {
      // Toggle this to `false` when the Express backend is ready
      const USE_MOCK = true; 

      if (USE_MOCK) {
        await delay(800); // Fake boot time
        return MOCK_FILESYSTEM;
      }

      // Future backend integration
      // const response = await fetch('/api/vfs/tree');
      // return response.json();
    }
  }
};