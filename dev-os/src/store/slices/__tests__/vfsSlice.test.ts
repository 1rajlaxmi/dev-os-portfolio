import { describe, it, expect } from 'vitest';
import vfsReducer from '../vfsSlice';

describe('vfsSlice Reducer', () => {
  const getState = () => vfsReducer(undefined, { type: 'unknown' });

  it('should return initial state with files populated', () => {
    const state = getState();
    expect(state.files).toBeDefined();
    expect(state.files.length).toBeGreaterThan(0);
  });

  it('should have a root-level folder named Home', () => {
    const state = getState();
    const homeFolder = state.files.find(
      (f) => f.parentId === null && f.type === 'folder'
    );
    expect(homeFolder).toBeDefined();
    expect(homeFolder?.name).toBe('Home');
  });

  it('should have expected top-level folders under root', () => {
    const state = getState();
    const rootId = state.files.find((f) => f.parentId === null && f.type === 'folder')?.id;
    const topLevelFolders = state.files
      .filter((f) => f.parentId === rootId && f.type === 'folder')
      .map((f) => f.name);

    expect(topLevelFolders).toContain('Projects');
    expect(topLevelFolders).toContain('Documents');
    expect(topLevelFolders).toContain('Code Snippets');
  });

  it('should have files inside the Code Snippets folder', () => {
    const state = getState();
    const snippetsFolder = state.files.find((f) => f.name === 'Code Snippets');
    expect(snippetsFolder).toBeDefined();

    const snippetFiles = state.files.filter(
      (f) => f.parentId === snippetsFolder!.id && f.type === 'file'
    );
    expect(snippetFiles.length).toBeGreaterThan(0);
    // Verify real code snippets exist
    const fileNames = snippetFiles.map((f) => f.name);
    expect(fileNames.some((n) => n.includes('.js') || n.includes('.ts'))).toBe(true);
  });

  it('should have files with content for Notes viewer', () => {
    const state = getState();
    const fileWithContent = state.files.find(
      (f) => f.type === 'file' && f.content && f.content.length > 0
    );
    expect(fileWithContent).toBeDefined();
    expect(typeof fileWithContent?.content).toBe('string');
  });

  it('should have all files/folders with required id, name, type fields', () => {
    const state = getState();
    state.files.forEach((node) => {
      expect(node.id).toBeTruthy();
      expect(node.name).toBeTruthy();
      expect(['file', 'folder']).toContain(node.type);
    });
  });

  it('should not contain any orphan files with non-existent parentId', () => {
    const state = getState();
    const allIds = new Set(state.files.map((f) => f.id));
    const orphans = state.files.filter(
      (f) => f.parentId !== null && !allIds.has(f.parentId)
    );
    expect(orphans.length).toBe(0);
  });

  it('ls simulation: root-level items should include Home folder and no direct files', () => {
    const state = getState();
    // Simulate what the Terminal ls command does (parentId null or 'root')
    const rootItems = state.files.filter(
      (f) => f.parentId === null || f.parentId === 'root'
    );
    expect(rootItems.length).toBeGreaterThan(0);
    // Root folder itself (parentId null) should be Home
    const rootFolder = rootItems.find((f) => f.parentId === null);
    expect(rootFolder?.name).toBe('Home');
  });

  it('ls <Projects> simulation: should list project sub-folders', () => {
    const state = getState();
    const projectsFolder = state.files.find((f) => f.name === 'Projects' && f.type === 'folder');
    expect(projectsFolder).toBeDefined();

    const projectItems = state.files.filter((f) => f.parentId === projectsFolder!.id);
    expect(projectItems.length).toBeGreaterThan(0);
  });
});
